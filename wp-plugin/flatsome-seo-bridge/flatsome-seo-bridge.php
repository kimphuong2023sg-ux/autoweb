<?php
/**
 * Plugin Name: Flatsome SEO AutoBridge
 * Plugin URI: https://github.com/seo-tools/flatsome-seo-bridge
 * Description: Plugin kết nối bảo mật cho Tool Auto Theme Flatsome. Cho phép chẩn đoán, dọn dẹp dữ liệu demo, cấu hình Theme Options và triển khai layout UX Builder chuẩn SEO chỉ với 1 click.
 * Version: 1.0.0
 * Author: SEO Automation Team
 * Author URI: https://antigravity.dev
 * License: GPLv2 or later
 * Text Domain: flatsome-seo-bridge
 */

if (!defined('ABSPATH')) {
    exit;
}

class Flatsome_SEO_Bridge {
    private static $instance = null;
    const OPTION_TOKEN = 'flatsome_seo_bridge_token';
    const API_NAMESPACE = 'flatsome-bridge/v1';

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_head', array($this, 'inject_menu_custom_css'), 999);
        add_action('init', array($this, 'heal_numeric_theme_mods'));

        // PHP 8+ Safety: Protect Flatsome function-custom-css.php from strict TypeError (int + string)
        add_filter('theme_mod_header_height_transparent', array($this, 'filter_numeric_mod_90'));
        add_filter('theme_mod_header_height', array($this, 'filter_numeric_mod_90'));
        add_filter('theme_mod_header_top_height', array($this, 'filter_numeric_mod_30'));
        add_filter('theme_mod_header_height_sticky', array($this, 'filter_numeric_mod_70'));
        add_filter('theme_mod_header_height_mobile', array($this, 'filter_numeric_mod_70'));
        add_filter('theme_mod_header_bottom_height', array($this, 'filter_numeric_mod_0'));

        // Mobile Sidebar Safety: Auto-strip 'account' & 'cart' if WooCommerce is not active to prevent 'WooCommerce not Found'
        add_filter('theme_mod_mobile_sidebar', array($this, 'filter_mobile_sidebar'));

        // Anti-wpautop: Strip empty <p> tags and comments from the top of the page content
        add_filter('the_content', array($this, 'remove_flatsome_empty_p_tags'), 11);

        // Allow message_box inside col and col_inner in Flatsome UX Builder tree
        add_filter('ux_builder_shortcode_data_message_box', array($this, 'filter_ux_builder_message_box_data'));
    }

    public function filter_ux_builder_message_box_data($data) {
        if (!isset($data['allow_in']) || !is_array($data['allow_in'])) {
            $data['allow_in'] = array();
        }
        if (!in_array('col', $data['allow_in'])) {
            $data['allow_in'][] = 'col';
            $data['allow_in'][] = 'col_inner';
        }
        return $data;
    }

    public function filter_numeric_mod_90($val) {
        if (!is_numeric($val) || empty($val)) return 90;
        return (int)$val;
    }

    public function filter_numeric_mod_70($val) {
        if (!is_numeric($val) || empty($val)) return 70;
        return (int)$val;
    }

    public function filter_numeric_mod_30($val) {
        if (is_array($val)) $val = reset($val);
        if (!is_numeric($val) || empty($val)) return 30;
        return (int)$val;
    }

    public function filter_numeric_mod_0($val) {
        if (!is_numeric($val) || empty($val)) return 0;
        return (int)$val;
    }

    public function filter_mobile_sidebar($elements) {
        if (!is_array($elements)) {
            return array('nav');
        }
        $is_woo = function_exists('is_woocommerce_activated') ? is_woocommerce_activated() : class_exists('WooCommerce');
        if (!$is_woo) {
            $elements = array_diff($elements, array('account', 'cart'));
        }
        return array_values($elements);
    }

    public function heal_numeric_theme_mods() {
        $trans = get_theme_mod('header_height_transparent');
        if ($trans === '' || is_array($trans) || ($trans !== false && !is_numeric($trans))) {
            set_theme_mod('header_height_transparent', 90);
        }
        $top = get_theme_mod('header_top_height');
        if (is_array($top) || $top === '' || ($top !== false && !is_numeric($top))) {
            set_theme_mod('header_top_height', 30);
        }
        $bot = get_theme_mod('header_bottom_height');
        if ($bot === '' || is_array($bot)) {
            remove_theme_mod('header_bottom_height');
        }

        // Cleanse mobile_sidebar of 'account' & 'cart' if WooCommerce is not active
        $mob_side = get_theme_mod('mobile_sidebar');
        if (is_array($mob_side)) {
            $is_woo = function_exists('is_woocommerce_activated') ? is_woocommerce_activated() : class_exists('WooCommerce');
            if (!$is_woo && (in_array('account', $mob_side) || in_array('cart', $mob_side))) {
                $mob_side = array_values(array_diff($mob_side, array('account', 'cart')));
                set_theme_mod('mobile_sidebar', $mob_side);
                set_theme_mod('header_mobile_sidebar', $mob_side);
            }
        }

        // Cleanse topbar of placeholder 'Assign a menu' if no topbar menu is assigned
        $top_els_r = get_theme_mod('topbar_elements_right');
        if (is_array($top_els_r) && (in_array('nav-top', $top_els_r) || in_array('top_nav', $top_els_r))) {
            $menu_locations = get_theme_mod('nav_menu_locations') ?: array();
            if (empty($menu_locations['top_bar_nav'])) {
                $top_els_r = array_values(array_diff($top_els_r, array('nav-top', 'top_nav')));
                set_theme_mod('topbar_elements_right', $top_els_r);
            }
        }
    }

    public function activate() {
        if (!get_option(self::OPTION_TOKEN)) {
            update_option(self::OPTION_TOKEN, wp_generate_password(32, false));
        }
    }

    public function add_admin_menu() {
        add_management_page(
            'Flatsome SEO Bridge',
            'Flatsome SEO Bridge',
            'manage_options',
            'flatsome-seo-bridge',
            array($this, 'render_admin_page')
        );
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        if (isset($_POST['regenerate_token']) && check_admin_referer('flatsome_bridge_regen')) {
            $new_token = wp_generate_password(32, false);
            update_option(self::OPTION_TOKEN, $new_token);
            echo '<div class="notice notice-success is-dismissible"><p>Đã tạo Secret Token mới thành công!</p></div>';
        }

        $token = get_option(self::OPTION_TOKEN);
        if (!$token) {
            $token = wp_generate_password(32, false);
            update_option(self::OPTION_TOKEN, $token);
        }

        $site_url = site_url();
        $api_url = rest_url(self::API_NAMESPACE);
        $current_theme = wp_get_theme();
        $is_flatsome = ($current_theme->get_template() === 'flatsome');
        ?>
        <div class="wrap" style="max-width: 860px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: #ffffff; padding: 28px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; margin-top: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #edf2f7; padding-bottom: 18px; margin-bottom: 24px;">
                    <div>
                        <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">🚀 Flatsome SEO AutoBridge</h1>
                        <p style="color: #64748b; margin: 6px 0 0 0; font-size: 14px;">Cổng kết nối bảo mật trực tiếp với Tool Auto Theme Flatsome</p>
                    </div>
                    <div>
                        <?php if ($is_flatsome): ?>
                            <span style="background: #ecfdf5; color: #065f46; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0; display: inline-flex; align-items: center; gap: 6px;">
                                <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
                                Theme Flatsome: <?php echo esc_html($current_theme->get('Version')); ?> (Hoạt động)
                            </span>
                        <?php else: ?>
                            <span style="background: #fef2f2; color: #991b1b; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 9999px; border: 1px solid #fecaca;">
                                ⚠️ Chưa kích hoạt theme Flatsome
                            </span>
                        <?php endif; ?>
                    </div>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                    <label style="display: block; font-weight: 600; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                        Website URL
                    </label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="site_url" value="<?php echo esc_url($site_url); ?>" readonly style="flex: 1; background: #ffffff; padding: 10px 14px; border-radius: 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 14px; color: #0f172a;" />
                        <button type="button" class="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($site_url); ?>'); alert('Đã copy Website URL!');" style="padding: 0 16px;">Copy</button>
                    </div>

                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 16px;">
                        <h3 style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 6px 0;">🔑 Cách kết nối đơn giản qua Tool:</h3>
                        <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0;">
                            Mở Tool trên trình duyệt ➔ Bấm <strong>"Kết Nối Website"</strong> ➔ Nhập <strong>Website URL</strong> cùng <strong>Tên đăng nhập (Username)</strong> và <strong>Mật khẩu (Password)</strong> tài khoản Quản trị viên (Admin) của website này.
                        </p>
                    </div>

                    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
                        <label style="display: block; font-weight: 600; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                            (Tùy chọn phụ) Secret API Token:
                        </label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="api_token" value="<?php echo esc_attr($token); ?>" readonly style="flex: 1; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 13px; color: #0f172a;" />
                            <button type="button" class="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($token); ?>'); alert('Đã copy Secret Token!');" style="padding: 0 14px;">Copy Token</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #edf2f7; padding-top: 16px;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                        Chỉ tài khoản có quyền Quản trị viên (Administrator) mới có thể thực hiện cấu hình tự động.
                    </p>
                    <form method="post" onsubmit="return confirm('Bạn có chắc muốn tạo lại token mới?');">
                        <?php wp_nonce_field('flatsome_bridge_regen'); ?>
                        <input type="submit" name="regenerate_token" class="button button-link-delete" value="Tạo lại Token" />
                    </form>
                </div>
            </div>
        </div>
        <?php
    }

    public function register_routes() {
        register_rest_route(self::API_NAMESPACE, '/inspect', array(
            'methods' => 'GET',
            'callback' => array($this, 'api_inspect'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/wipe-defaults', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_wipe_defaults'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/apply-theme-mods', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_apply_theme_mods'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/deploy-footer', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_deploy_footer'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/deploy-homepage', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_deploy_homepage'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/setup-essentials', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_setup_essentials'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/self-update', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_self_update'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/upload-media', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_upload_media'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/update-media', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_update_media'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/list-media', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'api_list_media'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/delete-media', array(
            'methods' => array('POST', 'DELETE'),
            'callback' => array($this, 'api_delete_media'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/batch-create-content', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_batch_create_content'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/list-content', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'api_list_content'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/delete-content', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_delete_content'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/get-menu', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'api_get_menu'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/save-menu', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_save_menu'),
            'permission_callback' => array($this, 'check_auth')
        ));
    }

    public function check_auth($request) {
        $username = '';
        $password = '';

        // 1. Check HTTP Basic Auth Header
        $auth_header = $request->get_header('authorization');
        if (!empty($auth_header) && stripos($auth_header, 'Basic ') === 0) {
            $creds = base64_decode(substr($auth_header, 6));
            if ($creds && strpos($creds, ':') !== false) {
                list($username, $password) = explode(':', $creds, 2);
            }
        }

        // 2. Check Custom Headers
        if (empty($username)) {
            $username = $request->get_header('x-wp-username');
            $password = $request->get_header('x-wp-password');
        }

        // 3. Check Body/Query Params
        if (empty($username)) {
            $body = $request->get_json_params();
            if (is_array($body)) {
                $username = !empty($body['username']) ? $body['username'] : '';
                $password = !empty($body['password']) ? $body['password'] : '';
            }
            if (empty($username)) {
                $username = $request->get_param('username');
                $password = $request->get_param('password');
            }
        }

        // Authenticate with WordPress user credentials
        if (!empty($username) && !empty($password)) {
            $user = wp_authenticate($username, $password);
            if (is_wp_error($user)) {
                return new WP_Error(
                    'unauthorized',
                    'Tên đăng nhập hoặc mật khẩu WordPress không chính xác: ' . wp_strip_all_tags($user->get_error_message()),
                    array('status' => 401)
                );
            }

            if (!user_can($user, 'manage_options')) {
                return new WP_Error(
                    'forbidden',
                    'Tài khoản WordPress này không có quyền Quản trị viên (Administrator)',
                    array('status' => 403)
                );
            }

            wp_set_current_user($user->ID);
            return true;
        }

        // 4. Fallback check: Secret Token
        $token = $request->get_header('x-bridge-token');
        if (empty($token)) {
            $token = $request->get_param('token');
        }
        $saved_token = get_option(self::OPTION_TOKEN);
        if ($saved_token && !empty($token) && hash_equals($saved_token, $token)) {
            return true;
        }

        return new WP_Error('unauthorized', 'Vui lòng cung cấp Tên đăng nhập và Mật khẩu WordPress (Admin) để xác thực.', array('status' => 401));
    }

    /**
     * API 1: Inspect WordPress and Flatsome State
     */
    public function api_inspect() {
        $theme = wp_get_theme();
        $is_flatsome = ($theme->get_template() === 'flatsome');
        $theme_slug = get_stylesheet();
        $theme_mods = get_theme_mods();

        // 1. Check Demo / Garbage items
        $hello_world = get_page_by_path('hello-world', OBJECT, 'post');
        $sample_page = get_page_by_path('sample-page', OBJECT, 'page');
        
        $posts_count = wp_count_posts('post');
        $pages_count = wp_count_posts('page');
        $products_count = post_type_exists('product') ? wp_count_posts('product') : null;
        $block_type = post_type_exists('blocks') ? 'blocks' : (post_type_exists('ux_block') ? 'ux_block' : 'blocks');
        $blocks_count = post_type_exists($block_type) ? wp_count_posts($block_type) : null;
        $comments_count = wp_count_comments();

        // Check active widgets
        $sidebars_widgets = wp_get_sidebars_widgets();
        $total_active_widgets = 0;
        foreach ($sidebars_widgets as $sidebar_id => $widgets) {
            if ($sidebar_id !== 'wp_inactive_widgets' && is_array($widgets)) {
                $total_active_widgets += count($widgets);
            }
        }

        // Check Front page
        $show_on_front = get_option('show_on_front');
        $page_on_front_id = (int) get_option('page_on_front');
        $front_page_info = null;
        if ($page_on_front_id && ($front_page = get_post($page_on_front_id))) {
            $front_page_info = array(
                'id' => $front_page->ID,
                'title' => $front_page->post_title,
                'content_length' => strlen($front_page->post_content),
                'post_content' => $front_page->post_content,
                'builder_state' => get_post_meta($front_page->ID, '_flatsome_autotheme_state', true),
                'has_ux_shortcodes' => (strpos($front_page->post_content, '[section') !== false || strpos($front_page->post_content, '[row') !== false)
            );
        }

        // Extract Flatsome specific theme_mods
        $flatsome_options = array(
            'color_primary' => !empty($theme_mods['color_primary']) ? $theme_mods['color_primary'] : '#446084',
            'color_secondary' => !empty($theme_mods['color_secondary']) ? $theme_mods['color_secondary'] : '#d26e4b',
            'topbar_content' => !empty($theme_mods['topbar_left']) ? $theme_mods['topbar_left'] : (!empty($theme_mods['topbar_right']) ? $theme_mods['topbar_right'] : ''),
            'footer_block' => !empty($theme_mods['footer_block']) ? $theme_mods['footer_block'] : '',
            'site_logo' => !empty($theme_mods['site_logo']) ? wp_get_attachment_url($theme_mods['site_logo']) : '',
            'box_shadow' => !empty($theme_mods['box_shadow']) ? $theme_mods['box_shadow'] : false,
            'layout' => !empty($theme_mods['layout']) ? $theme_mods['layout'] : 'full-width',
            'default_page_template' => !empty($theme_mods['default_page_template']) ? $theme_mods['default_page_template'] : 'default'
        );

        // List existing UX Blocks
        $ux_blocks_list = array();
        $target_block_types = array('blocks', 'ux_block');
        foreach ($target_block_types as $bt) {
            if (post_type_exists($bt)) {
                $blocks_query = get_posts(array(
                    'post_type' => $bt,
                    'posts_per_page' => 100,
                    'post_status' => array('publish', 'draft')
                ));
                foreach ($blocks_query as $b) {
                    $ux_blocks_list[] = array(
                        'id' => $b->ID,
                        'title' => $b->post_title,
                        'slug' => $b->post_name
                    );
                }
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'site' => array(
                'name' => get_bloginfo('name'),
                'url' => site_url(),
                'theme' => $theme->get('Name'),
                'theme_version' => $theme->get('Version'),
                'is_flatsome' => $is_flatsome,
                'admin_email' => get_bloginfo('admin_email'),
                'permalink_structure' => get_option('permalink_structure')
            ),
            'stats' => array(
                'published_posts' => (int) ($posts_count->publish ?? 0),
                'published_pages' => (int) ($pages_count->publish ?? 0),
                'products' => $products_count ? (int) ($products_count->publish ?? 0) : 0,
                'ux_blocks' => $blocks_count ? (int) ($blocks_count->publish ?? 0) : 0,
                'active_widgets' => $total_active_widgets,
                'has_hello_world' => (bool) $hello_world,
                'has_sample_page' => (bool) $sample_page,
                'is_demo_loaded' => (($posts_count->publish ?? 0) > 8 || ($products_count && ($products_count->publish ?? 0) > 4))
            ),
            'flatsome' => $flatsome_options,
            'homepage' => $front_page_info,
            'ux_blocks' => $ux_blocks_list
        ));
    }

    /**
     * API 2: Wipe Demo & Garbage Data
     */
    public function api_wipe_defaults($request) {
        $body = $request->get_json_params() ?: array();
        $wipe_posts = isset($body['wipe_posts']) ? (bool)$body['wipe_posts'] : true;
        $wipe_pages = isset($body['wipe_pages']) ? (bool)$body['wipe_pages'] : true;
        $wipe_products = isset($body['wipe_products']) ? (bool)$body['wipe_products'] : true;
        $wipe_widgets = isset($body['wipe_widgets']) ? (bool)$body['wipe_widgets'] : true;
        $wipe_menus = isset($body['wipe_menus']) ? (bool)$body['wipe_menus'] : true;
        $wipe_blocks = isset($body['wipe_blocks']) ? (bool)$body['wipe_blocks'] : true;

        $deleted_items = array(
            'posts' => 0,
            'pages' => 0,
            'products' => 0,
            'widgets_cleared' => false,
            'menus' => 0,
            'ux_blocks' => 0
        );

        global $wpdb;

        // Delete Posts (Hello World and other posts if requested)
        if ($wipe_posts) {
            $post_ids = $wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type = 'post'");
            foreach ($post_ids as $pid) {
                wp_delete_post((int)$pid, true);
                $deleted_items['posts']++;
            }
        }

        // Delete All Pages except Front Page (Chỉ chừa lại đúng 1 Trang Chủ duy nhất)
        if ($wipe_pages) {
            // Lấy toàn bộ ID của các trang trên WordPress bất kể trạng thái (publish, draft, trash...)
            $all_page_ids = $wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type = 'page'");

            // Các slug trang con mặc định / demo / phụ / chính sách KHÔNG ĐƯỢC CHỌN làm Trang Chủ
            $subpage_slugs = array(
                'gioi-thieu', 'lien-he', 'chinh-sach-bao-mat', 'dieu-khoan-su-dung', 
                'sample-page', 'privacy-policy', 'cart', 'checkout', 'my-account'
            );

            // 1. Xác định hoặc chỉ định Trang Chủ
            $front_id = (int) get_option('page_on_front');

            // Kiểm tra $front_id có tồn tại và không phải là trang demo/subpage rác
            $front_post = $front_id ? get_post($front_id) : null;
            if (!$front_id || !$front_post || $front_post->post_type !== 'page') {
                $front_id = 0;
            } elseif (in_array(strtolower($front_post->post_name), $subpage_slugs)) {
                $front_id = 0;
            }

            if (!$front_id) {
                // Thử tìm trang có slug hoặc tiêu đề là Trang Chủ
                foreach ($all_page_ids as $pid) {
                    $p = get_post($pid);
                    if (!$p) continue;
                    $slug = strtolower($p->post_name);
                    $title = mb_strtolower($p->post_title, 'UTF-8');
                    if (in_array($slug, array('home', 'trang-chu', 'homepage')) || in_array($title, array('trang chủ', 'trang chu', 'home'))) {
                        $front_id = (int)$pid;
                        break;
                    }
                }

                // Nếu vẫn chưa có trang nào có tên Trang Chủ, tìm trang đầu tiên KHÔNG thuộc danh sách $subpage_slugs
                if (!$front_id && !empty($all_page_ids)) {
                    foreach ($all_page_ids as $pid) {
                        $p = get_post($pid);
                        if (!$p) continue;
                        $slug = strtolower($p->post_name);
                        if (!in_array($slug, $subpage_slugs)) {
                            $front_id = (int)$pid;
                            break;
                        }
                    }
                }

                // Nếu tất cả các trang đều là trang demo/rác/giới thiệu/liên hệ, tạo mới 1 Trang Chủ hoàn chỉnh
                if (!$front_id) {
                    $front_id = wp_insert_post(array(
                        'post_title' => 'Trang Chủ',
                        'post_name' => 'trang-chu',
                        'post_status' => 'publish',
                        'post_type' => 'page'
                    ));
                }
            }

            // Thiết lập show_on_front = page và page_on_front = $front_id
            if ($front_id && !is_wp_error($front_id)) {
                update_option('show_on_front', 'page');
                update_option('page_on_front', (int)$front_id);

                // Chuẩn hóa tên và xuất bản Trang Chủ
                wp_update_post(array(
                    'ID' => $front_id,
                    'post_title' => 'Trang Chủ',
                    'post_name' => 'trang-chu',
                    'post_status' => 'publish'
                ));
            }

            // 2. XÓA SẠCH 100% TẤT CẢ CÁC TRANG CÒN LẠI (BAO GỒM GIỚI THIỆU, LIÊN HỆ, BÀI MẪU...)
            // CHỈ GIỮ LẠI DUY NHẤT 1 TRANG CHỦ $front_id
            foreach ($all_page_ids as $pid) {
                $pid = (int)$pid;
                if ($front_id && $pid === (int)$front_id) {
                    continue; // Giữ lại duy nhất Trang Chủ
                }
                wp_delete_post($pid, true);
                $deleted_items['pages']++;
            }

            // Truy quét SQL lần 2 để đảm bảo 100% không còn bất kỳ trang nào khác ngoài $front_id
            if ($front_id) {
                $wpdb->query($wpdb->prepare(
                    "DELETE FROM {$wpdb->posts} WHERE post_type = 'page' AND ID != %d",
                    $front_id
                ));
                // Dọn dẹp postmeta rác của các trang vừa bị xóa
                $wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE post_id NOT IN (SELECT ID FROM {$wpdb->posts})");
            }
        }

        // Delete Products (demo shoes, clothes, etc.)
        if ($wipe_products && post_type_exists('product')) {
            $product_ids = $wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type = 'product'");
            foreach ($product_ids as $pid) {
                wp_delete_post((int)$pid, true);
                $deleted_items['products']++;
            }
        }

        // Reset All Sidebars Widgets
        if ($wipe_widgets) {
            $empty_widgets = array('wp_inactive_widgets' => array());
            update_option('sidebars_widgets', $empty_widgets);
            $deleted_items['widgets_cleared'] = true;
        }

        // Delete Demo Menus & Setup Clean Menu With ONLY Trang Chủ
        if ($wipe_menus) {
            $menus = wp_get_nav_menus();
            if (!empty($menus)) {
                foreach ($menus as $menu) {
                    wp_delete_nav_menu($menu->term_id);
                    $deleted_items['menus']++;
                }
            }

            // Dọn sạch toàn bộ items menu mồ côi
            $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'nav_menu_item'");

            // Xóa tất cả terms của nav_menu để tránh xung đột term_exists
            $nav_terms = get_terms(array('taxonomy' => 'nav_menu', 'hide_empty' => false));
            if (!is_wp_error($nav_terms) && !empty($nav_terms)) {
                foreach ($nav_terms as $nt) {
                    wp_delete_term($nt->term_id, 'nav_menu');
                }
            }

            // Tạo Menu mới tinh chỉ có đúng duy nhất 1 link là Trang Chủ
            $menu_name = 'Main Menu';
            $menu_id = wp_create_nav_menu($menu_name);
            if (is_wp_error($menu_id)) {
                $existing_term = get_term_by('name', $menu_name, 'nav_menu');
                if ($existing_term) {
                    $menu_id = $existing_term->term_id;
                }
            }

            if (!is_wp_error($menu_id) && $menu_id) {
                // Xóa mọi item cũ trong menu này nếu còn sót
                $existing_items = wp_get_nav_menu_items($menu_id);
                if (!empty($existing_items)) {
                    foreach ($existing_items as $ei) {
                        wp_delete_post($ei->ID, true);
                    }
                }

                // Thêm DUY NHẤT 1 item Trang Chủ
                wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-title' => 'Trang Chủ',
                    'menu-item-url' => home_url('/'),
                    'menu-item-status' => 'publish'
                ));

                // Gán vào tất cả các vị trí menu của Flatsome để Flatsome không bao giờ tự fallback ra wp_page_menu()
                $locations = get_theme_mod('nav_menu_locations');
                if (!is_array($locations)) {
                    $locations = array();
                }
                $locations['primary'] = (int)$menu_id;
                $locations['primary_mobile'] = (int)$menu_id;
                $locations['footer'] = (int)$menu_id;
                set_theme_mod('nav_menu_locations', $locations);
            }
        }

        // Delete Demo UX Blocks (Flatsome demo blocks like Blog Header, Demos, Elements Overview, Footer - About us, etc.)
        if ($wipe_blocks) {
            $target_block_types = array('blocks', 'ux_block');
            foreach ($target_block_types as $b_type) {
                $b_ids = $wpdb->get_col($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_type = %s", $b_type));
                if (!empty($b_ids)) {
                    foreach ($b_ids as $bid) {
                        wp_delete_post((int)$bid, true);
                        $deleted_items['ux_blocks']++;
                    }
                    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->posts} WHERE post_type = %s", $b_type));
                }
            }

            // Xóa sạch các category rác của block_categories
            $block_cats = get_terms(array('taxonomy' => 'block_categories', 'hide_empty' => false));
            if (!is_wp_error($block_cats) && !empty($block_cats)) {
                foreach ($block_cats as $bc) {
                    wp_delete_term($bc->term_id, 'block_categories');
                }
            }

            // Gỡ bỏ liên kết theme_mod footer_block cũ nếu có
            set_theme_mod('footer_block', '');
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã dọn dẹp sạch sẽ dữ liệu rác mặc định của website!',
            'deleted' => $deleted_items
        ));
    }

    /**
     * API 3: Apply Theme Mods (Personalizar / Customizer)
     */
    public function api_apply_theme_mods($request) {
        $body = $request->get_json_params() ?: array();

        if (!empty($body['color_primary'])) {
            set_theme_mod('color_primary', sanitize_hex_color($body['color_primary']));
        }
        if (!empty($body['color_secondary'])) {
            set_theme_mod('color_secondary', sanitize_hex_color($body['color_secondary']));
        }
        if (isset($body['topbar_text'])) {
            $topbar = sanitize_text_field($body['topbar_text']);
            if (empty($topbar)) {
                set_theme_mod('topbar_show', 0);
                set_theme_mod('topbar_left', '');
                set_theme_mod('topbar_right', '');
                set_theme_mod('topbar_elements_left', array());
                set_theme_mod('topbar_elements_center', array());
                set_theme_mod('topbar_elements_right', array());
                set_theme_mod('header_mobile_elements_top', array());
            } else {
                set_theme_mod('topbar_elements_left', array('html'));
                set_theme_mod('topbar_left', $topbar);
                set_theme_mod('topbar_show', 1);
                // Triệt tiêu placeholder 'Assign a menu' và icons thừa trên Topbar
                set_theme_mod('topbar_elements_right', array());
                set_theme_mod('topbar_elements_center', array());
                set_theme_mod('topbar_right', '');
            }
        }
        if (!empty($body['footer_block_id'])) {
            set_theme_mod('footer_block', (int)$body['footer_block_id']);
            set_theme_mod('footer_1', 0); // Disable widget footer 1
            set_theme_mod('footer_2', 0); // Disable widget footer 2
        }
        if (isset($body['copyright_text'])) {
            $copyright = sanitize_text_field($body['copyright_text']);
            if (empty($copyright)) {
                set_theme_mod('footer_bottom_show', 0);
                set_theme_mod('footer_bottom_text', '');
            } else {
                set_theme_mod('footer_bottom_show', 1);
                set_theme_mod('footer_bottom_text', $copyright);
            }
        }
        if (!empty($body['site_width'])) {
            set_theme_mod('site_width', sanitize_text_field($body['site_width']));
        }

        // Set standard typography if provided
        if (!empty($body['font_heading'])) {
            set_theme_mod('type_headings', sanitize_text_field($body['font_heading']));
        }
        if (!empty($body['font_body'])) {
            set_theme_mod('type_texts', sanitize_text_field($body['font_body']));
        }
        if (isset($body['default_page_template'])) {
            $tpl = sanitize_text_field($body['default_page_template']);
            set_theme_mod('default_page_template', $tpl);

            // Cập nhật luôn template cho Trang Chủ tĩnh để phản ánh ngay lập tức
            $front_id = (int) get_option('page_on_front');
            if ($front_id) {
                $is_flatsome = (wp_get_theme()->get_template() === 'flatsome');
                if ($is_flatsome && ($tpl === 'full-width' || $tpl === 'full-width-transparent-header' || $tpl === 'full-width-header-on-scroll' || $tpl === 'full-width-parallax-title')) {
                    update_post_meta($front_id, '_wp_page_template', 'page-blank.php');
                } else {
                    update_post_meta($front_id, '_wp_page_template', 'default');
                }
            }
        }
        if (!empty($body['layout'])) {
            set_theme_mod('layout', sanitize_text_field($body['layout']));
        }

        // ==========================================
        // FLATSOME HEADER CONFIGURATION & PRESETS
        // ==========================================
        if (!empty($body['header_preset'])) {
            $preset_id = sanitize_text_field($body['header_preset']);
            $presets = function_exists('get_flatsome_header_presets') ? get_flatsome_header_presets() : array();

            if (isset($presets[$preset_id]['settings']) && is_array($presets[$preset_id]['settings'])) {
                foreach ($presets[$preset_id]['settings'] as $k => $v) {
                    if (in_array($k, array('header_height_transparent', 'header_height', 'header_height_sticky', 'header_height_mobile'), true)) {
                        if ($v === '' || $v === null || !is_numeric($v)) {
                            $v = ($k === 'header_height_transparent') ? 90 : (($k === 'header_height') ? 90 : 70);
                        } else {
                            $v = (int)$v;
                        }
                    } elseif ($k === 'header_top_height') {
                        if (is_array($v)) $v = reset($v);
                        $v = (is_numeric($v) && (int)$v > 0) ? (int)$v : 30;
                    } elseif ($k === 'header_bottom_height') {
                        if ($v === '' || $v === null || $v === 0 || $v === '0') {
                            remove_theme_mod('header_bottom_height');
                            continue;
                        }
                        $v = (int)$v;
                    }
                    set_theme_mod($k, $v);
                }
            } else {
                // Built-in Flatsome Preset Fallback Definitions
                if ($preset_id === 'header-wide-nav-dark' || $preset_id === 'header-wide-nav') {
                    set_theme_mod('header_width', 'container');
                    set_theme_mod('header_height', 90);
                    set_theme_mod('header_bottom_height', 45);
                    set_theme_mod('header_elements_left', array('search-form'));
                    set_theme_mod('header_elements_right', array('button-1', 'button-2', 'cart'));
                    set_theme_mod('header_elements_bottom_left', array('nav'));
                    set_theme_mod('header_elements_bottom_center', array());
                    set_theme_mod('header_elements_bottom_right', array());
                    if ($preset_id === 'header-wide-nav-dark') {
                        set_theme_mod('header_color', 'dark');
                        set_theme_mod('header_bg', 'rgba(22,22,22,0.9)');
                        set_theme_mod('nav_position_bg', '#0f3a61');
                        set_theme_mod('nav_position_color', 'dark');
                    } else {
                        set_theme_mod('header_color', 'light');
                        set_theme_mod('header_bg', 'rgba(255,255,255,0.9)');
                        set_theme_mod('nav_position_bg', '#424242');
                        set_theme_mod('nav_position_color', 'dark');
                    }
                } elseif ($preset_id === 'header-simple-signup') {
                    set_theme_mod('header_height', 84);
                    remove_theme_mod('header_bottom_height');
                    set_theme_mod('header_elements_left', array('search', 'nav'));
                    set_theme_mod('header_elements_right', array('button-1', 'button-2'));
                    set_theme_mod('header_elements_bottom_left', array());
                } elseif ($preset_id === 'header-simple-right-buttons') {
                    set_theme_mod('header_height', 84);
                    remove_theme_mod('header_bottom_height');
                    set_theme_mod('header_elements_left', array());
                    set_theme_mod('header_elements_right', array('nav', 'search', 'button-1', 'button-2'));
                    set_theme_mod('header_elements_bottom_left', array());
                } elseif ($preset_id === 'header-default-center') {
                    set_theme_mod('header_height', 100);
                    set_theme_mod('logo_position', 'center');
                    set_theme_mod('header_elements_left', array('search', 'nav'));
                    set_theme_mod('header_elements_right', array('account', 'divider', 'cart'));
                    set_theme_mod('header_elements_bottom_left', array());
                } elseif ($preset_id === 'header-default-dark') {
                    set_theme_mod('header_height', 100);
                    set_theme_mod('header_color', 'dark');
                    set_theme_mod('header_bg', 'rgba(0,0,0,0.9)');
                    set_theme_mod('header_elements_left', array('search', 'nav'));
                    set_theme_mod('header_elements_right', array('account', 'divider', 'cart'));
                    set_theme_mod('header_elements_bottom_left', array());
                } elseif ($preset_id === 'header-cart-top') {
                    set_theme_mod('topbar_show', 1);
                    set_theme_mod('topbar_elements_right', array('nav-top', 'account', 'cart'));
                    set_theme_mod('header_elements_left', array('nav'));
                    set_theme_mod('header_elements_right', array('search-form'));
                } else {
                    // header-default
                    set_theme_mod('header_height', 100);
                    set_theme_mod('header_elements_left', array('search', 'nav'));
                    set_theme_mod('header_elements_right', array('account', 'divider', 'cart'));
                    set_theme_mod('header_elements_bottom_left', array());
                }
            }
        }

        // Header Main Height, BG & Colors
        if (!empty($body['header_height'])) {
            set_theme_mod('header_height', (int)$body['header_height']);
        }
        if (isset($body['header_height_transparent'])) {
            $hht = (int)$body['header_height_transparent'];
            set_theme_mod('header_height_transparent', $hht > 0 ? $hht : 90);
        }
        if (!empty($body['header_width'])) {
            set_theme_mod('header_width', sanitize_text_field($body['header_width']));
        }
        if (!empty($body['header_color'])) {
            set_theme_mod('header_color', sanitize_text_field($body['header_color']));
        }
        if (isset($body['header_bg'])) {
            set_theme_mod('header_bg', sanitize_text_field($body['header_bg']));
        }

        // Header Bottom (Wide Nav Bar)
        if (isset($body['header_bottom_show'])) {
            if ($body['header_bottom_show']) {
                $bottom_height = !empty($body['header_bottom_height']) ? (int)$body['header_bottom_height'] : 45;
                set_theme_mod('header_bottom_height', $bottom_height);
                if (!empty($body['header_bottom_bg'])) {
                    set_theme_mod('nav_position_bg', sanitize_text_field($body['header_bottom_bg']));
                }
                if (!empty($body['header_bottom_color'])) {
                    set_theme_mod('nav_position_color', sanitize_text_field($body['header_bottom_color']));
                }
                // Ensure main menu is inside bottom bar
                $bottom_left = get_theme_mod('header_elements_bottom_left', array());
                if (!in_array('nav', (array)$bottom_left) && !in_array('nav', (array)get_theme_mod('header_elements_bottom_center', array()))) {
                    set_theme_mod('header_elements_bottom_left', array('nav'));
                }
                // Remove nav from header_elements_left/right if on bottom bar
                $hel = array_diff((array)get_theme_mod('header_elements_left', array()), array('nav'));
                $her = array_diff((array)get_theme_mod('header_elements_right', array()), array('nav'));
                set_theme_mod('header_elements_left', array_values($hel));
                set_theme_mod('header_elements_right', array_values($her));
            } else {
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());
                // Place nav back in header main if not present
                $her = (array)get_theme_mod('header_elements_right', array());
                $hel = (array)get_theme_mod('header_elements_left', array());
                if (!in_array('nav', $her) && !in_array('nav', $hel)) {
                    $hel[] = 'nav';
                    set_theme_mod('header_elements_left', array_values($hel));
                }
            }
        }

        // Process Header Bottom Full Container vs Container & Anti-wrap CSS
        $header_css = '';
        if (isset($body['header_bottom_width']) && $body['header_bottom_width'] === 'full-width') {
            $header_css .= "\n/* Flatsome Header Bottom Full-Width Container */\n#wide-nav .container, .header-bottom .container { max-width: 100% !important; width: 100% !important; padding-left: 25px !important; padding-right: 25px !important; }\n";
        } elseif (isset($body['header_bottom_width']) && $body['header_bottom_width'] === 'container') {
            $header_css .= "\n/* Flatsome Header Bottom Standard Container */\n#wide-nav .container, .header-bottom .container { max-width: var(--site-width, 1200px) !important; }\n";
        }

        if (!empty($body['header_nav_no_wrap'])) {
            $header_css .= "\n/* Flatsome Prevent Nav Items Wrapping into 2 rows */\n#wide-nav .nav, .header-bottom .nav, #wide-nav .header-bottom-nav { flex-wrap: nowrap !important; white-space: nowrap !important; }\n#wide-nav .flex-left, #wide-nav .flex-center, #wide-nav .flex-right { flex-shrink: 0; }\n#wide-nav .nav > li > a { white-space: nowrap !important; }\n";
        }

        update_option('flatsome_seo_header_custom_css', $header_css);

        // Sticky Header Settings
        if (isset($body['header_sticky'])) {
            set_theme_mod('header_sticky', !empty($body['header_sticky']) ? 1 : 0);
        }
        if (isset($body['bottombar_sticky'])) {
            set_theme_mod('bottombar_sticky', !empty($body['bottombar_sticky']) ? 1 : 0);
        }
        if (isset($body['topbar_sticky'])) {
            set_theme_mod('topbar_sticky', !empty($body['topbar_sticky']) ? 1 : 0);
        }
        if (!empty($body['header_height_sticky'])) {
            set_theme_mod('header_height_sticky', (int)$body['header_height_sticky']);
        }
        if (!empty($body['sticky_style'])) {
            set_theme_mod('sticky_style', sanitize_text_field($body['sticky_style']));
        }
        if (isset($body['sticky_hide_on_scroll'])) {
            set_theme_mod('sticky_hide_on_scroll', !empty($body['sticky_hide_on_scroll']) ? 1 : 0);
        }

        // Header Button 1
        if (isset($body['header_button_1'])) {
            set_theme_mod('header_button_1', sanitize_text_field($body['header_button_1']));
        }
        if (isset($body['header_button_1_link'])) {
            set_theme_mod('header_button_1_link', esc_url_raw($body['header_button_1_link']));
        }
        if (!empty($body['header_button_1_link_target'])) {
            set_theme_mod('header_button_1_link_target', sanitize_text_field($body['header_button_1_link_target']));
        }
        if (!empty($body['header_button_1_color'])) {
            set_theme_mod('header_button_1_color', sanitize_text_field($body['header_button_1_color']));
        }
        if (!empty($body['header_button_1_style'])) {
            set_theme_mod('header_button_1_style', sanitize_text_field($body['header_button_1_style']));
        }
        if (!empty($body['header_button_1_radius'])) {
            set_theme_mod('header_button_1_radius', sanitize_text_field($body['header_button_1_radius']));
        }

        // Header Button 2
        if (isset($body['header_button_2'])) {
            set_theme_mod('header_button_2', sanitize_text_field($body['header_button_2']));
        }
        if (isset($body['header_button_2_link'])) {
            set_theme_mod('header_button_2_link', esc_url_raw($body['header_button_2_link']));
        }
        if (!empty($body['header_button_2_link_target'])) {
            set_theme_mod('header_button_2_link_target', sanitize_text_field($body['header_button_2_link_target']));
        }
        if (!empty($body['header_button_2_color'])) {
            set_theme_mod('header_button_2_color', sanitize_text_field($body['header_button_2_color']));
        }
        if (!empty($body['header_button_2_style'])) {
            set_theme_mod('header_button_2_style', sanitize_text_field($body['header_button_2_style']));
        }
        if (!empty($body['header_button_2_radius'])) {
            set_theme_mod('header_button_2_radius', sanitize_text_field($body['header_button_2_radius']));
        }

        // Place or remove Button 1 and Button 2 in Header Elements Right
        $her = (array)get_theme_mod('header_elements_right', array());
        if (isset($body['header_button_1_show'])) {
            if ($body['header_button_1_show']) {
                if (!in_array('button-1', $her)) {
                    $her[] = 'button-1';
                }
            } else {
                $her = array_diff($her, array('button-1'));
            }
        }
        if (isset($body['header_button_2_show'])) {
            if ($body['header_button_2_show']) {
                if (!in_array('button-2', $her)) {
                    $her[] = 'button-2';
                }
            } else {
                $her = array_diff($her, array('button-2'));
            }
        }

        // Header Elements toggles: search, cart, account, divider
        $hel = (array)get_theme_mod('header_elements_left', array());

        if (isset($body['header_show_search'])) {
            $her = array_diff($her, array('search', 'search-form'));
            $hel = array_diff($hel, array('search', 'search-form'));
            if ($body['header_show_search'] === 'icon') {
                $her[] = 'search';
            } elseif ($body['header_show_search'] === 'form') {
                $her[] = 'search-form';
            }
        }

        if (isset($body['header_show_cart'])) {
            if ($body['header_show_cart']) {
                if (!in_array('cart', $her)) $her[] = 'cart';
            } else {
                $her = array_diff($her, array('cart'));
                $hel = array_diff($hel, array('cart'));
            }
        }

        if (isset($body['header_show_account'])) {
            if ($body['header_show_account']) {
                if (!in_array('account', $her)) $her[] = 'account';
            } else {
                $her = array_diff($her, array('account'));
                $hel = array_diff($hel, array('account'));
            }
        }

        // Clean up orphaned divider if both cart and account are disabled
        if (empty($body['header_show_cart']) && empty($body['header_show_account'])) {
            $her = array_diff($her, array('divider'));
            $hel = array_diff($hel, array('divider'));
        }

        set_theme_mod('header_elements_left', array_values($hel));
        set_theme_mod('header_elements_right', array_values($her));

        // Auto-heal any invalid numeric values that might crash Flatsome CSS builder in PHP 8+
        $this->heal_numeric_theme_mods();

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã cập nhật cấu hình Theme Flatsome & Header thành công!',
            'theme_mods' => get_theme_mods()
        ));
    }

    /**
     * API 4: Deploy Footer UX Block
     */
    public function api_deploy_footer($request) {
        $body = $request->get_json_params() ?: array();
        $title = !empty($body['title']) ? sanitize_text_field($body['title']) : 'Footer Chuyên Nghiệp - SEO';
        $shortcode = !empty($body['shortcode']) ? $body['shortcode'] : '';

        if (empty($shortcode)) {
            return new WP_Error('missing_content', 'Nội dung shortcode footer không được để trống', array('status' => 400));
        }

        // Check if block already exists with this title
        $block_type = post_type_exists('blocks') ? 'blocks' : (post_type_exists('ux_block') ? 'ux_block' : 'blocks');
        $existing = get_page_by_title($title, OBJECT, $block_type);
        if (!$existing) {
            $existing = get_page_by_path(sanitize_title($title), OBJECT, $block_type);
        }
        $block_id = 0;

        if ($existing) {
            wp_update_post(array(
                'ID' => $existing->ID,
                'post_content' => $shortcode,
                'post_type' => $block_type,
                'post_status' => 'publish'
            ));
            $block_id = $existing->ID;
        } else {
            $block_id = wp_insert_post(array(
                'post_title' => $title,
                'post_name' => sanitize_title($title),
                'post_content' => $shortcode,
                'post_type' => $block_type,
                'post_status' => 'publish'
            ));
        }

        if (is_wp_error($block_id)) {
            return $block_id;
        }

        // Assign to theme_mods as active footer
        set_theme_mod('footer_block', $block_id);
        set_theme_mod('footer_1', 0);
        set_theme_mod('footer_2', 0);

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã tạo và gán Footer UX Block thành công!',
            'footer_block_id' => $block_id,
            'footer_block_title' => $title
        ));
    }

    /**
     * API 5: Deploy Homepage (UX Builder Shortcodes)
     */
    public function api_deploy_homepage($request) {
        $body = $request->get_json_params() ?: array();
        $title = !empty($body['title']) ? sanitize_text_field($body['title']) : 'Trang Chủ';
        $shortcode = !empty($body['shortcode']) ? $body['shortcode'] : '';
        $shortcode = preg_replace('/<!--\s*FLATSOME_BUILDER_STATE:.*?-->\s*/is', '', $shortcode);
        $shortcode = trim($shortcode);

        // Check if a front page already exists
        $current_front_id = (int) get_option('page_on_front');
        $page_id = 0;

        if ($current_front_id && ($front_page = get_post($current_front_id))) {
            wp_update_post(array(
                'ID' => $front_page->ID,
                'post_title' => $title,
                'post_content' => $shortcode,
                'post_status' => 'publish'
            ));
            $page_id = $front_page->ID;
        } else {
            $page_id = wp_insert_post(array(
                'post_title' => $title,
                'post_content' => $shortcode,
                'post_type' => 'page',
                'post_status' => 'publish'
            ));
        }

        if (is_wp_error($page_id)) {
            return $page_id;
        }

        // Set Flatsome full width template
        update_post_meta($page_id, '_wp_page_template', 'page-blank.php');

        // Set as Static Front Page
        update_option('show_on_front', 'page');
        update_option('page_on_front', $page_id);

        $state_json = !empty($body['state_json']) ? $body['state_json'] : '';
        if (!empty($state_json)) {
            update_post_meta($page_id, '_flatsome_autotheme_state', $state_json);
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã triển khai Trang Chủ và thiết lập Trang Chủ tĩnh thành công!',
            'page_id' => $page_id,
            'page_title' => $title,
            'edit_uxbuilder_url' => admin_url("post.php?post={$page_id}&action=edit&app=uxbuilder")
        ));
    }

    /**
     * API 6: Setup SEO Essentials (Permalinks, E-E-A-T Pages, Menus)
     */
    public function api_setup_essentials($request) {
        $body = $request->get_json_params() ?: array();
        $brand_name = !empty($body['brand_name']) ? sanitize_text_field($body['brand_name']) : get_bloginfo('name');
        $hotline = !empty($body['hotline']) ? sanitize_text_field($body['hotline']) : '0988.xxx.xxx';
        $email = !empty($body['email']) ? sanitize_email($body['email']) : get_bloginfo('admin_email');
        $address = !empty($body['address']) ? sanitize_text_field($body['address']) : 'Hà Nội, Việt Nam';

        // 1. Set Permalink Structure to /%postname%/ (Essential for SEO)
        global $wp_rewrite;
        $wp_rewrite->set_permalink_structure('/%postname%/');
        update_option('permalink_structure', '/%postname%/');
        $wp_rewrite->flush_rules(true);

        // 2. Create E-E-A-T Pages if explicitly requested
        $created_page_ids = array();
        $create_pages = !empty($body['create_pages']);
        if ($create_pages) {
            $pages_to_create = array(
                'gioi-thieu' => array(
                    'title' => 'Giới Thiệu',
                    'content' => "<h2>Về Chúng Tôi - {$brand_name}</h2><p>{$brand_name} là đơn vị uy tín chuyên cung cấp các giải pháp chất lượng hàng đầu. Chúng tôi luôn cam kết mang lại giá trị thực tế và sự hài lòng tối đa cho khách hàng.</p><h3>Tầm Nhìn & Sứ Mệnh</h3><p>Đồng hành cùng sự phát triển bền vững của đối tác và khách hàng trên toàn quốc.</p>"
                ),
                'lien-he' => array(
                    'title' => 'Liên Hệ',
                    'content' => "<h2>Thông Tin Liên Hệ - {$brand_name}</h2><p>Hãy liên hệ với chúng tôi để nhận được tư vấn tốt nhất:</p><ul><li><strong>Hotline:</strong> {$hotline}</li><li><strong>Email:</strong> {$email}</li><li><strong>Địa chỉ:</strong> {$address}</li></ul>"
                ),
                'chinh-sach-bao-mat' => array(
                    'title' => 'Chính Sách Bảo Mật',
                    'content' => "<h2>Chính Sách Bảo Mật Thông Tin</h2><p>{$brand_name} cam kết bảo mật tuyệt đối các thông tin cá nhân của người dùng khi truy cập website tuân theo quy định pháp luật hiện hành.</p>"
                ),
                'dieu-khoan-su-dung' => array(
                    'title' => 'Điều Khoản Sử Dụng',
                    'content' => "<h2>Điều Khoản Dịch Vụ</h2><p>Khi truy cập và sử dụng dịch vụ tại website {$brand_name}, quý khách đồng ý tuân thủ các quy định và điều khoản của chúng tôi.</p>"
                )
            );

            foreach ($pages_to_create as $slug => $data) {
                $existing = get_page_by_path($slug, OBJECT, 'page');
                if (!$existing) {
                    $pid = wp_insert_post(array(
                        'post_title' => $data['title'],
                        'post_name' => $slug,
                        'post_content' => $data['content'],
                        'post_type' => 'page',
                        'post_status' => 'publish'
                    ));
                    if (!is_wp_error($pid)) {
                        $created_page_ids[$slug] = $pid;
                    }
                } else {
                    $created_page_ids[$slug] = $existing->ID;
                }
            }
        }

        // 3. Create Navigation Menu (Primary Menu) - Chỉ chứa duy nhất Trang Chủ
        $locations = get_theme_mod('nav_menu_locations') ?: array();
        $primary_menu_id = !empty($locations['primary']) ? (int)$locations['primary'] : 0;
        
        if (!$primary_menu_id || !wp_get_nav_menu_object($primary_menu_id)) {
            $menu_name = 'Main Menu';
            $menu_id = wp_create_nav_menu($menu_name);
            if (is_wp_error($menu_id)) {
                $existing_term = get_term_by('name', $menu_name, 'nav_menu');
                if ($existing_term) {
                    $menu_id = $existing_term->term_id;
                }
            }

            if (!is_wp_error($menu_id) && $menu_id) {
                // Add Home only
                wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-title' => 'Trang Chủ',
                    'menu-item-url' => home_url('/'),
                    'menu-item-status' => 'publish'
                ));

                // Assign to Flatsome primary & mobile locations
                $locations['primary'] = (int)$menu_id;
                $locations['primary_mobile'] = (int)$menu_id;
                set_theme_mod('nav_menu_locations', $locations);
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã thiết lập Permalink, tạo 4 trang chính sách E-E-A-T và cấu hình Menu chính thành công!',
            'created_pages' => $created_page_ids
        ));
    }

    /**
     * API 7: Self-Update (Hot-reload / Push code directly to WordPress)
     */
    public function api_self_update($request) {
        $body = $request->get_json_params() ?: array();
        $code = !empty($body['code']) ? $body['code'] : '';

        if (empty($code)) {
            return new WP_Error('missing_code', 'Nội dung code plugin không được để trống', array('status' => 400));
        }

        if (strpos($code, 'Flatsome_SEO_Bridge') === false) {
            return new WP_Error('invalid_code', 'Code không hợp lệ hoặc thiếu class Flatsome_SEO_Bridge', array('status' => 400));
        }

        $file_path = __FILE__;
        if (!is_writable($file_path)) {
            return new WP_Error('not_writable', 'File plugin không có quyền ghi trên máy chủ hosting', array('status' => 500));
        }

        $written = file_put_contents($file_path, $code);
        if ($written === false) {
            return new WP_Error('write_failed', 'Ghi file thất bại trên máy chủ', array('status' => 500));
        }

        if (function_exists('opcache_reset')) {
            @opcache_reset();
        }

        $this->heal_numeric_theme_mods();

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã tự động đẩy và cập nhật code Plugin trên WordPress thành công rực rỡ!',
            'bytes_written' => $written,
            'file' => $file_path,
            'timestamp' => current_time('mysql')
        ));
    }

    /**
     * API 8: Tải ảnh lên Thư viện Media WordPress (kèm Alt text, Caption, Title, Description chuẩn SEO)
     */
    public function api_upload_media($request) {
        $body = $request->get_json_params() ?: array();

        $media_id = !empty($body['media_id']) ? (int)$body['media_id'] : (!empty($body['mediaId']) ? (int)$body['mediaId'] : 0);
        if ($media_id > 0 && empty($_FILES['file']) && empty($body['file_data']) && empty($body['fileData'])) {
            return $this->api_update_media($request);
        }

        $filename = !empty($body['filename']) ? sanitize_file_name($body['filename']) : 'image-' . time() . '.png';
        $file_data = !empty($body['file_data']) ? $body['file_data'] : '';
        $image_url = !empty($body['image_url']) ? esc_url_raw($body['image_url']) : '';

        $alt_text = !empty($body['alt_text']) ? sanitize_text_field($body['alt_text']) : '';
        $title = !empty($body['title']) ? sanitize_text_field($body['title']) : '';
        $caption = !empty($body['caption']) ? sanitize_text_field($body['caption']) : '';
        $description = !empty($body['description']) ? wp_kses_post($body['description']) : '';

        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');

        $upload = null;

        if (!empty($_FILES['file'])) {
            $upload = wp_handle_upload($_FILES['file'], array('test_form' => false));
            if (isset($upload['error'])) {
                return new WP_Error('upload_error', $upload['error'], array('status' => 400));
            }
        } elseif (!empty($file_data)) {
            // Hỗ trợ Base64 (data:image/...;base64,xxxx)
            if (preg_match('/^data:image\/(\w+);base64,/', $file_data, $type)) {
                $file_data = substr($file_data, strpos($file_data, ',') + 1);
            }
            $binary = base64_decode($file_data);
            if (!$binary) {
                return new WP_Error('invalid_base64', 'Dữ liệu ảnh base64 không hợp lệ', array('status' => 400));
            }

            $upload = wp_upload_bits($filename, null, $binary);
            if (!empty($upload['error'])) {
                return new WP_Error('upload_error', $upload['error'], array('status' => 400));
            }
        } elseif (!empty($image_url)) {
            $tmp = download_url($image_url);
            if (is_wp_error($tmp)) {
                return $tmp;
            }
            $file_array = array(
                'name' => basename(parse_url($image_url, PHP_URL_PATH) ?: 'remote-image.jpg'),
                'tmp_name' => $tmp
            );
            $upload = wp_handle_sideload($file_array, array('test_form' => false));
            if (isset($upload['error'])) {
                @unlink($tmp);
                return new WP_Error('upload_error', $upload['error'], array('status' => 400));
            }
        } else {
            return new WP_Error('missing_file', 'Vui lòng cung cấp file ảnh, dữ liệu base64 hoặc URL ảnh', array('status' => 400));
        }

        $file_path = $upload['file'];
        $file_url = $upload['url'];
        $file_type = wp_check_filetype(basename($file_path), null);

        $attachment = array(
            'guid'           => $file_url,
            'post_mime_type' => $file_type['type'] ?: 'image/jpeg',
            'post_title'     => !empty($title) ? $title : preg_replace('/\.[^.]+$/', '', basename($file_path)),
            'post_content'   => $description,
            'post_excerpt'   => $caption,
            'post_status'    => 'inherit'
        );

        $attach_id = wp_insert_attachment($attachment, $file_path);
        if (is_wp_error($attach_id)) {
            return $attach_id;
        }

        $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
        wp_update_attachment_metadata($attach_id, $attach_data);

        if (!empty($alt_text)) {
            update_post_meta($attach_id, '_wp_attachment_image_alt', $alt_text);
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã tải ảnh lên Thư viện Media WordPress thành công!',
            'media' => array(
                'id' => $attach_id,
                'url' => wp_get_attachment_url($attach_id),
                'title' => get_the_title($attach_id),
                'alt' => get_post_meta($attach_id, '_wp_attachment_image_alt', true) ?: '',
                'caption' => wp_get_attachment_caption($attach_id) ?: '',
                'description' => get_post_field('post_content', $attach_id) ?: '',
                'thumb' => wp_get_attachment_image_url($attach_id, 'thumbnail') ?: wp_get_attachment_url($attach_id),
            )
        ));
    }

    /**
     * API 8b: Cập nhật thông tin SEO của ảnh đã có trong WordPress Media (Title, Alt, Caption, Description)
     */
    public function api_update_media($request) {
        $body = $request->get_json_params() ?: array();
        $media_id = !empty($body['media_id']) ? (int)$body['media_id'] : (!empty($body['mediaId']) ? (int)$body['mediaId'] : 0);
        if (!$media_id) {
            return new WP_Error('missing_id', 'Vui lòng cung cấp ID của ảnh cần cập nhật', array('status' => 400));
        }

        $post = get_post($media_id);
        if (!$post || $post->post_type !== 'attachment') {
            return new WP_Error('not_found', "Không tìm thấy tệp đính kèm Media #{$media_id} trong WordPress", array('status' => 404));
        }

        $post_data = array('ID' => $media_id);
        if (isset($body['title'])) $post_data['post_title'] = sanitize_text_field($body['title']);
        if (isset($body['caption'])) $post_data['post_excerpt'] = sanitize_text_field($body['caption']);
        if (isset($body['description'])) $post_data['post_content'] = wp_kses_post($body['description']);

        wp_update_post($post_data);

        if (isset($body['alt_text'])) {
            update_post_meta($media_id, '_wp_attachment_image_alt', sanitize_text_field($body['alt_text']));
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => "Đã cập nhật thông tin ảnh Media #{$media_id} thành công!",
            'media' => array(
                'id' => $media_id,
                'url' => wp_get_attachment_url($media_id),
                'title' => get_the_title($media_id),
                'alt' => get_post_meta($media_id, '_wp_attachment_image_alt', true) ?: '',
                'caption' => wp_get_attachment_caption($media_id) ?: '',
                'description' => get_post_field('post_content', $media_id) ?: '',
                'thumb' => wp_get_attachment_image_url($media_id, 'thumbnail') ?: wp_get_attachment_url($media_id),
            )
        ));
    }

    /**
     * API 9: Lấy danh sách ảnh gần nhất từ Media Library
     */
    public function api_list_media($request) {
        $query = new WP_Query(array(
            'post_type' => 'attachment',
            'post_mime_type' => 'image',
            'post_status' => 'inherit',
            'posts_per_page' => 30,
            'orderby' => 'date',
            'order' => 'DESC'
        ));

        $media = array();
        foreach ($query->posts as $post) {
            $media[] = array(
                'id' => $post->ID,
                'url' => wp_get_attachment_url($post->ID),
                'title' => $post->post_title,
                'alt' => get_post_meta($post->ID, '_wp_attachment_image_alt', true) ?: '',
                'caption' => $post->post_excerpt ?: '',
                'description' => $post->post_content ?: '',
                'thumb' => wp_get_attachment_image_url($post->ID, 'thumbnail') ?: wp_get_attachment_url($post->ID),
                'date' => $post->post_date
            );
        }

        return rest_ensure_response(array(
            'success' => true,
            'media' => $media
        ));
    }

    /**
     * API 9b: Xóa vĩnh viễn tệp ảnh khỏi Thư viện Media WordPress (Hỗ trợ cả xóa 1 ảnh hoặc hàng loạt ảnh)
     */
    public function api_delete_media($request) {
        $params = $request->get_json_params() ?: array();
        if (empty($params)) {
            $params = $request->get_params();
        }

        $ids = array();
        if (!empty($params['mediaIds']) && is_array($params['mediaIds'])) {
            $ids = $params['mediaIds'];
        } elseif (!empty($params['media_ids']) && is_array($params['media_ids'])) {
            $ids = $params['media_ids'];
        } elseif (!empty($params['ids']) && is_array($params['ids'])) {
            $ids = $params['ids'];
        } elseif (!empty($params['mediaId'])) {
            $ids = array((int)$params['mediaId']);
        } elseif (!empty($params['media_id'])) {
            $ids = array((int)$params['media_id']);
        } elseif (!empty($params['id'])) {
            $ids = array((int)$params['id']);
        }

        if (empty($ids)) {
            return new WP_Error('missing_params', 'Vui lòng cung cấp ID của ảnh cần xóa.', array('status' => 400));
        }

        $deleted_ids = array();
        $failed_ids = array();

        foreach ($ids as $raw_id) {
            $attachment_id = (int)$raw_id;
            if ($attachment_id <= 0) continue;

            // Xóa vĩnh viễn tệp trên hosting (force_delete = true) và record trong database
            $result = wp_delete_attachment($attachment_id, true);
            if ($result) {
                $deleted_ids[] = $attachment_id;
            } else {
                $failed_ids[] = $attachment_id;
            }
        }

        $total_deleted = count($deleted_ids);
        return rest_ensure_response(array(
            'success' => $total_deleted > 0,
            'message' => "Đã xóa vĩnh viễn {$total_deleted} ảnh khỏi Thư viện Media WordPress thành công.",
            'deleted_ids' => $deleted_ids,
            'failed_ids' => $failed_ids,
            'count' => $total_deleted
        ));
    }

    /**
     * API 10: Tạo hoặc cập nhật hàng loạt Trang (Page), Bài viết (Post), hoặc Chuyên mục (Category)
     */
    public function api_batch_create_content($request) {
        $body = $request->get_json_params() ?: array();
        $default_type = !empty($body['default_type']) ? sanitize_text_field($body['default_type']) : 'page';
        $items = !empty($body['items']) && is_array($body['items']) ? $body['items'] : array();

        if (empty($items)) {
            return new WP_Error('empty_items', 'Danh sách mục tạo hàng loạt không được để trống.', array('status' => 400));
        }

        $results = array();
        $summary = array(
            'total' => count($items),
            'created' => 0,
            'updated' => 0,
            'failed' => 0
        );

        $front_page_id = (int) get_option('page_on_front');

        foreach ($items as $index => $item) {
            $raw_title = isset($item['title']) ? trim((string)$item['title']) : '';
            $raw_slug = isset($item['slug']) ? trim((string)$item['slug']) : '';
            $raw_desc = isset($item['description']) ? trim((string)$item['description']) : '';
            $type = !empty($item['type']) ? sanitize_text_field($item['type']) : $default_type;

            if (empty($raw_title)) {
                $summary['failed']++;
                $results[] = array(
                    'index' => $index,
                    'title' => $raw_title,
                    'slug' => $raw_slug,
                    'type' => $type,
                    'success' => false,
                    'error' => 'Tiêu đề không được để trống'
                );
                continue;
            }

            // Xử lý slug
            $clean_slug = trim($raw_slug, '/');
            $is_root = ($raw_slug === '/' || $raw_slug === '' || $clean_slug === '');

            // Nếu là Trang Chủ (slug là / hoặc rỗng và type là page)
            if ($is_root && $type === 'page') {
                if ($front_page_id && ($front_post = get_post($front_page_id))) {
                    $front_update = array(
                        'ID' => $front_page_id,
                        'post_title' => $raw_title
                    );
                    if ($raw_desc !== '') {
                        $front_update['post_excerpt'] = $raw_desc;
                    }
                    wp_update_post($front_update);
                    $summary['updated']++;
                    $results[] = array(
                        'index' => $index,
                        'id' => $front_page_id,
                        'title' => $raw_title,
                        'slug' => '/',
                        'type' => 'page',
                        'action' => 'updated_front_page',
                        'url' => home_url('/'),
                        'success' => true
                    );
                    continue;
                }
            }

            // Chuẩn hóa slug
            $slug = sanitize_title($clean_slug ?: $raw_title);

            try {
                global $wpdb;

                // 1. Xác định ID hiện có (nếu truyền lên từ frontend)
                $target_id = !empty($item['id']) && is_numeric($item['id']) ? (int)$item['id'] : 0;
                if (!$target_id && !empty($item['term_id']) && is_numeric($item['term_id'])) {
                    $target_id = (int)$item['term_id'];
                }

                // 2. Tìm bài viết/trang hiện có (theo target_id hoặc theo slug)
                $existing_post = null;
                if ($target_id > 0) {
                    $p = get_post($target_id);
                    if ($p && in_array($p->post_type, array('page', 'post')) && $p->post_status !== 'trash') {
                        $existing_post = $p;
                    }
                }
                if (!$existing_post && !empty($slug)) {
                    // Tìm post hoặc page có cùng post_name (slug) trong CSDL
                    $found_id = $wpdb->get_var($wpdb->prepare(
                        "SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type IN ('page', 'post') AND post_status != 'trash' ORDER BY ID DESC LIMIT 1",
                        $slug
                    ));
                    if ($found_id) {
                        $existing_post = get_post((int)$found_id);
                    }
                }

                // 3. Tìm Category hiện có (theo target_id, slug hoặc title)
                $existing_term = null;
                if ($target_id > 0) {
                    $t = get_term($target_id, 'category');
                    if (!is_wp_error($t) && !empty($t)) {
                        $existing_term = $t;
                    }
                }
                if (!$existing_term && !empty($slug)) {
                    $existing_term = get_term_by('slug', $slug, 'category');
                }
                if (!$existing_term && !empty($raw_title)) {
                    $existing_term = get_term_by('name', $raw_title, 'category');
                }
                $default_cat_id = (int) get_option('default_category');

                // XỬ LÝ CHUYỂN ĐỔI VÀ ĐỒNG BỘ THEO LOẠI MONG MUỐN
                if ($type === 'page' || $type === 'post') {
                    // Nếu trước đó là Category mà người dùng đổi sang Page/Post -> Xóa Category cũ đi
                    if ($existing_term && (int)$existing_term->term_id !== $default_cat_id) {
                        wp_delete_term((int)$existing_term->term_id, 'category');
                    }

                    if ($existing_post) {
                        // Đã có trang hoặc bài viết hiện có -> CẬP NHẬT VÀ TỰ ĐỘNG CHUYỂN ĐỔI POST_TYPE NẾU KHÁC LOẠI!
                        $is_converted = ($existing_post->post_type !== $type);
                        $post_update = array(
                            'ID' => $existing_post->ID,
                            'post_title' => $raw_title,
                            'post_name' => $slug,
                            'post_type' => $type,
                            'post_status' => 'publish'
                        );
                        if ($raw_desc !== '') {
                            $post_update['post_excerpt'] = $raw_desc;
                        }
                        wp_update_post($post_update);

                        // Cưỡng chế cập nhật trường post_type trong bảng wp_posts để đảm bảo 100% không bị sót
                        $wpdb->update($wpdb->posts, array('post_type' => $type), array('ID' => $existing_post->ID));
                        clean_post_cache($existing_post->ID);

                        // Xóa sạch mọi bản ghi page/post khác bị trùng slug để tránh tình trạng web thật tồn tại song song cả trang và bài viết
                        $wpdb->query($wpdb->prepare(
                            "DELETE FROM {$wpdb->posts} WHERE post_name = %s AND post_type IN ('page', 'post') AND ID != %d",
                            $slug, $existing_post->ID
                        ));

                        $summary['updated']++;
                        $results[] = array(
                            'index' => $index,
                            'id' => $existing_post->ID,
                            'title' => $raw_title,
                            'slug' => $slug,
                            'type' => $type,
                            'action' => $is_converted ? "chuyển sang {$type}" : 'updated',
                            'url' => get_permalink($existing_post->ID),
                            'success' => true
                        );
                    } else {
                        // Chưa có: Tạo mới hoàn toàn
                        // Trước khi tạo, dọn sạch bất kỳ bản ghi rác nào trùng slug
                        $wpdb->query($wpdb->prepare(
                            "DELETE FROM {$wpdb->posts} WHERE post_name = %s AND post_type IN ('page', 'post')",
                            $slug
                        ));

                        if ($type === 'page') {
                            $content = !empty($item['content']) ? $item['content'] : "[section]\n[row]\n[col span=\"12\"]\n<h1>" . esc_html($raw_title) . "</h1>\n" . (!empty($raw_desc) ? "<p class=\"lead\">" . esc_html($raw_desc) . "</p>\n" : "") . "<p>Nội dung đang được cập nhật...</p>\n[/col]\n[/row]\n[/section]";
                        } else {
                            $content = !empty($item['content']) ? $item['content'] : "<h2>" . esc_html($raw_title) . "</h2>\n" . (!empty($raw_desc) ? "<p class=\"lead\">" . esc_html($raw_desc) . "</p>\n" : "") . "<p>Bài viết chuẩn SEO đang được biên tập nội dung chi tiết...</p>";
                        }

                        $new_args = array(
                            'post_title' => $raw_title,
                            'post_name' => $slug,
                            'post_content' => $content,
                            'post_type' => $type,
                            'post_status' => 'publish'
                        );
                        if ($raw_desc !== '') {
                            $new_args['post_excerpt'] = $raw_desc;
                        }
                        $new_id = wp_insert_post($new_args);
                        if (is_wp_error($new_id)) {
                            throw new Exception($new_id->get_error_message());
                        }

                        $summary['created']++;
                        $results[] = array(
                            'index' => $index,
                            'id' => $new_id,
                            'title' => $raw_title,
                            'slug' => $slug,
                            'type' => $type,
                            'action' => 'created',
                            'url' => get_permalink($new_id),
                            'success' => true
                        );
                    }
                } elseif ($type === 'category') {
                    // Nếu trước đó là Page hoặc Post mà người dùng đổi thành Category -> XÓA SẠCH Page/Post đó đi!
                    if ($existing_post) {
                        wp_delete_post($existing_post->ID, true);
                    }
                    $wpdb->query($wpdb->prepare(
                        "DELETE FROM {$wpdb->posts} WHERE post_name = %s AND post_type IN ('page', 'post')",
                        $slug
                    ));

                    if ($existing_term) {
                        $cat_data = array(
                            'name' => $raw_title,
                            'slug' => $slug
                        );
                        if ($raw_desc !== '') {
                            $cat_data['description'] = $raw_desc;
                        }
                        wp_update_term($existing_term->term_id, 'category', $cat_data);
                        $summary['updated']++;
                        $results[] = array(
                            'index' => $index,
                            'id' => $existing_term->term_id,
                            'title' => $raw_title,
                            'slug' => $slug,
                            'type' => 'category',
                            'action' => 'updated',
                            'url' => get_term_link($existing_term->term_id, 'category'),
                            'success' => true
                        );
                    } else {
                        $insert_data = array('slug' => $slug);
                        if ($raw_desc !== '') {
                            $insert_data['description'] = $raw_desc;
                        }
                        $new_term = wp_insert_term($raw_title, 'category', $insert_data);
                        if (is_wp_error($new_term)) {
                            throw new Exception($new_term->get_error_message());
                        }
                        $term_id = (int)$new_term['term_id'];
                        $summary['created']++;
                        $results[] = array(
                            'index' => $index,
                            'id' => $term_id,
                            'title' => $raw_title,
                            'slug' => $slug,
                            'type' => 'category',
                            'action' => 'created',
                            'url' => get_term_link($term_id, 'category'),
                            'success' => true
                        );
                    }
                } else {
                    $summary['failed']++;
                    $results[] = array(
                        'index' => $index,
                        'title' => $raw_title,
                        'slug' => $slug,
                        'type' => $type,
                        'success' => false,
                        'error' => "Loại nội dung '{$type}' không được hỗ trợ"
                    );
                }
            } catch (Exception $e) {
                $summary['failed']++;
                $results[] = array(
                    'index' => $index,
                    'title' => $raw_title,
                    'slug' => $slug,
                    'type' => $type,
                    'success' => false,
                    'error' => $e->getMessage()
                );
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => "Đã xử lý xong {$summary['total']} mục: tạo mới {$summary['created']}, cập nhật {$summary['updated']}, lỗi {$summary['failed']}.",
            'summary' => $summary,
            'results' => $results
        ));
    }

    /**
     * API 11: Lấy danh sách Chuyên mục, Trang, Bài viết hiện có trên WordPress
     */
    public function api_list_content($request) {
        $body = $request->get_json_params() ?: array();
        $filter_type = !empty($body['type']) ? sanitize_text_field($body['type']) : $request->get_param('type');
        if (empty($filter_type)) {
            $filter_type = 'all';
        }

        $items = array();
        $front_page_id = (int) get_option('page_on_front');

        // 1. Lấy Categories (Chuyên mục)
        if ($filter_type === 'all' || $filter_type === 'category') {
            $terms = get_terms(array(
                'taxonomy' => 'category',
                'hide_empty' => false,
                'orderby' => 'name',
                'order' => 'ASC'
            ));
            $default_cat_id = (int) get_option('default_category');
            if (!is_wp_error($terms) && !empty($terms)) {
                foreach ($terms as $t) {
                    $is_default = ((int)$t->term_id === $default_cat_id);
                    $items[] = array(
                        'id' => (int)$t->term_id,
                        'term_id' => (int)$t->term_id,
                        'title' => $t->name,
                        'slug' => '/' . $t->slug,
                        'description' => $t->description ?: '',
                        'type' => 'category',
                        'count' => (int)$t->count,
                        'is_default' => $is_default,
                        'url' => get_term_link($t->term_id, 'category'),
                        'is_existing' => true
                    );
                }
            }
        }

        // 2. Lấy Pages (Trang) - Quét sạch 100% không giới hạn
        if ($filter_type === 'all' || $filter_type === 'page') {
            $pages = get_posts(array(
                'post_type' => 'page',
                'post_status' => array('publish', 'draft', 'pending', 'future', 'private'),
                'posts_per_page' => -1,
                'orderby' => 'date',
                'order' => 'DESC'
            ));
            foreach ($pages as $p) {
                $is_front = ($front_page_id && (int)$p->ID === $front_page_id);
                $items[] = array(
                    'id' => (int)$p->ID,
                    'title' => $p->post_title,
                    'slug' => $is_front ? '/' : ('/' . $p->post_name),
                    'description' => $p->post_excerpt ?: '',
                    'type' => 'page',
                    'url' => get_permalink($p->ID),
                    'is_existing' => true,
                    'is_front_page' => $is_front
                );
            }
        }

        // 3. Lấy Posts (Bài viết) - Quét sạch 100% không giới hạn 100 bài
        if ($filter_type === 'all' || $filter_type === 'post') {
            $posts = get_posts(array(
                'post_type' => 'post',
                'post_status' => array('publish', 'draft', 'pending', 'future', 'private'),
                'posts_per_page' => -1,
                'orderby' => 'date',
                'order' => 'DESC'
            ));
            foreach ($posts as $p) {
                $items[] = array(
                    'id' => (int)$p->ID,
                    'title' => $p->post_title,
                    'slug' => '/' . $p->post_name,
                    'description' => $p->post_excerpt ?: '',
                    'type' => 'post',
                    'url' => get_permalink($p->ID),
                    'is_existing' => true
                );
            }
        }

        // 4. Lấy Custom Post Types công khai khác (ví dụ: tickets, products, portfolio...)
        $cpt_types = get_post_types(array('public' => true, '_builtin' => false), 'objects');
        if (!empty($cpt_types)) {
            foreach ($cpt_types as $cpt_name => $cpt_obj) {
                if (in_array($cpt_name, array('blocks', 'ux_block', 'elementor_library'))) continue;
                if ($filter_type === 'all' || $filter_type === $cpt_name || $filter_type === 'post') {
                    $cpt_posts = get_posts(array(
                        'post_type' => $cpt_name,
                        'post_status' => array('publish', 'draft', 'future', 'private'),
                        'posts_per_page' => -1,
                        'orderby' => 'date',
                        'order' => 'DESC'
                    ));
                    foreach ($cpt_posts as $p) {
                        $items[] = array(
                            'id' => (int)$p->ID,
                            'title' => $p->post_title,
                            'slug' => '/' . $p->post_name,
                            'description' => $p->post_excerpt ?: '',
                            'type' => 'post',
                            'cpt_type' => $cpt_name,
                            'cpt_label' => !empty($cpt_obj->labels->singular_name) ? $cpt_obj->labels->singular_name : $cpt_name,
                            'url' => get_permalink($p->ID),
                            'is_existing' => true
                        );
                    }
                }
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'total' => count($items),
            'items' => $items
        ));
    }

    /**
     * API 12: Xóa Chuyên mục, Bài viết hoặc Trang trực tiếp trên WordPress
     */
    public function api_delete_content($request) {
        $body = $request->get_json_params() ?: array();
        $type = !empty($body['type']) ? sanitize_text_field($body['type']) : 'category';
        $id = !empty($body['id']) ? (int)$body['id'] : 0;
        $slug = !empty($body['slug']) ? trim(sanitize_title($body['slug']), '/') : '';

        if ($type === 'category') {
            $term = null;
            if ($id > 0) {
                $term = get_term($id, 'category');
            } elseif (!empty($slug)) {
                $term = get_term_by('slug', $slug, 'category');
            }

            if (!$term || is_wp_error($term)) {
                return new WP_Error('not_found', 'Không tìm thấy chuyên mục để xóa trên WordPress', array('status' => 404));
            }

            $default_cat_id = (int) get_option('default_category');
            if ((int)$term->term_id === $default_cat_id) {
                // Kiểm tra xem có chuyên mục nào khác để chuyển default sang trước khi xóa không
                $other_terms = get_terms(array(
                    'taxonomy' => 'category',
                    'hide_empty' => false,
                    'exclude' => array($term->term_id)
                ));

                if (!empty($other_terms) && !is_wp_error($other_terms)) {
                    $new_default = reset($other_terms);
                    update_option('default_category', (int)$new_default->term_id);
                } else {
                    return new WP_Error('cannot_delete_default', 'Đây là chuyên mục mặc định duy nhất trên website, WordPress bắt buộc phải giữ lại tối thiểu 1 chuyên mục. Bạn có thể bấm Cập Nhật để đổi tên/slug của chuyên mục này thành mục bạn muốn sử dụng!', array('status' => 400));
                }
            }

            $deleted = wp_delete_term($term->term_id, 'category');
            if (is_wp_error($deleted)) {
                return $deleted;
            }

            return rest_ensure_response(array(
                'success' => true,
                'message' => "Đã xóa vĩnh viễn chuyên mục '{$term->name}' khỏi WordPress thành công!",
                'id' => $term->term_id
            ));
        } elseif ($type === 'page' || $type === 'post') {
            $target_id = $id;
            if (!$target_id && !empty($slug)) {
                $p = get_page_by_path($slug, OBJECT, $type);
                if ($p) $target_id = $p->ID;
            }
            if ($target_id) {
                wp_delete_post($target_id, true);
                return rest_ensure_response(array(
                    'success' => true,
                    'message' => "Đã xóa thành công mục khỏi WordPress.",
                    'id' => $target_id
                ));
            }
            return new WP_Error('not_found', 'Không tìm thấy bài viết hoặc trang để xóa', array('status' => 404));
        }

        return new WP_Error('invalid_type', 'Loại nội dung không hợp lệ', array('status' => 400));
    }

    /**
     * Chuẩn hóa văn bản loại bỏ toàn bộ dấu tiếng Việt
     */
    private function clean_text_nav($str) {
        $str = (string)$str;
        $str = mb_strtolower($str, 'UTF-8');
        $str = preg_replace('/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/u', 'a', $str);
        $str = preg_replace('/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/u', 'e', $str);
        $str = preg_replace('/(ì|í|ị|ỉ|ĩ)/u', 'i', $str);
        $str = preg_replace('/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/u', 'o', $str);
        $str = preg_replace('/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/u', 'u', $str);
        $str = preg_replace('/(ỳ|ý|ỵ|ỷ|ỹ)/u', 'y', $str);
        $str = preg_replace('/(đ)/u', 'd', $str);
        return trim($str);
    }

    /**
     * Kiểm tra xem một mục điều hướng có phải là Trang Chủ không
     */
    private function is_home_nav_item($title, $url, $object_id = 0, $slug = '') {
        $front_page_id = (int)get_option('page_on_front');
        if ($front_page_id > 0 && (int)$object_id === $front_page_id) {
            return true;
        }

        $t = $this->clean_text_nav($title);
        $home_titles = array('trang chu', 'home', 'inicio', 'homepage', 'pagina de inicio', 'front page', 'frontpage');
        if (in_array($t, $home_titles, true)) {
            return true;
        }

        $raw_url = trim((string)$url);
        $home_url_clean = untrailingslashit(home_url());
        $url_clean = untrailingslashit($raw_url);
        if ($raw_url === '/' || (!empty($url_clean) && !empty($home_url_clean) && $url_clean === $home_url_clean)) {
            return true;
        }

        $clean_slug = trim((string)$slug, '/');
        if (!empty($clean_slug)) {
            $s = $this->clean_text_nav($clean_slug);
            if (in_array($s, array('home', 'trang-chu', 'inicio'), true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * API 13: Lấy danh sách Menus và các mục menu chi tiết
     */
    public function api_get_menu($request) {
        $body = $request->get_json_params() ?: array();
        $target_menu_id = !empty($body['menu_id']) ? (int)$body['menu_id'] : (int)$request->get_param('menu_id');
        $target_menu_name = !empty($body['menu_name']) ? sanitize_text_field($body['menu_name']) : $request->get_param('menu_name');

        $all_menus = wp_get_nav_menus();
        $menus_list = array();
        if (!empty($all_menus)) {
            foreach ($all_menus as $m) {
                $menus_list[] = array(
                    'id' => (int)$m->term_id,
                    'name' => $m->name,
                    'slug' => $m->slug,
                    'count' => (int)$m->count
                );
            }
        }

        $locations = get_theme_mod('nav_menu_locations') ?: array();
        $primary_menu_id = !empty($locations['primary']) ? (int)$locations['primary'] : 0;

        // Xác định menu cần lấy
        $selected_menu = null;
        if ($target_menu_id) {
            $selected_menu = wp_get_nav_menu_object($target_menu_id);
        } elseif (!empty($target_menu_name)) {
            $selected_menu = wp_get_nav_menu_object($target_menu_name);
        } elseif ($primary_menu_id) {
            $selected_menu = wp_get_nav_menu_object($primary_menu_id);
        } elseif (!empty($all_menus)) {
            $selected_menu = reset($all_menus);
        }

        // Nếu hoàn toàn chưa có bất kỳ Menu nào, tự động tạo "Main Menu" mặc định có Trang Chủ
        if (!$selected_menu) {
            $menu_name = 'Main Menu';
            $new_menu_id = wp_create_nav_menu($menu_name);
            if (!is_wp_error($new_menu_id)) {
                $selected_menu = wp_get_nav_menu_object($new_menu_id);
                // Thêm link Trang Chủ
                wp_update_nav_menu_item($new_menu_id, 0, array(
                    'menu-item-title' => 'Trang Chủ',
                    'menu-item-url' => home_url('/'),
                    'menu-item-status' => 'publish'
                ));
                $locations['primary'] = (int)$new_menu_id;
                $locations['primary_mobile'] = (int)$new_menu_id;
                set_theme_mod('nav_menu_locations', $locations);
            }
        }

        $items = array();
        $assigned_locations = array();
        if ($selected_menu) {
            $raw_items = wp_get_nav_menu_items($selected_menu->term_id);
            if (!empty($raw_items)) {
                $home_item = null;
                $other_items = array();

                foreach ($raw_items as $ri) {
                    $ri_title = $ri->title ?: $ri->post_title;
                    $ri_url = $ri->url ?: '';
                    $ri_slug = '';
                    if ($ri->object === 'page' || $ri->object === 'post') {
                        $p_obj = get_post($ri->object_id);
                        if ($p_obj) {
                            $ri_slug = $p_obj->post_name;
                        }
                    } elseif ($ri->object === 'category') {
                        $term_obj = get_term($ri->object_id, 'category');
                        if ($term_obj && !is_wp_error($term_obj)) {
                            $ri_slug = $term_obj->slug;
                        }
                    }

                    $is_home = $this->is_home_nav_item($ri_title, $ri_url, $ri->object_id, $ri_slug);

                    if ($is_home) {
                        if (!$home_item) {
                            $home_item = array(
                                'client_id' => 'item_' . $ri->ID,
                                'id' => (int)$ri->ID,
                                'title' => $ri_title ?: 'Trang Chủ',
                                'url' => home_url('/'),
                                'type' => 'custom',
                                'object' => 'custom',
                                'object_id' => (int)$ri->object_id,
                                'parent_client_id' => null,
                                'parent_id' => 0,
                                'order' => 1,
                                'target' => $ri->target ?: ''
                            );
                        }
                        // Loại bỏ hoàn toàn các Trang Chủ thừa/trùng lặp
                        continue;
                    }

                    $other_items[] = array(
                        'client_id' => 'item_' . $ri->ID,
                        'id' => (int)$ri->ID,
                        'title' => $ri_title,
                        'url' => $ri_url ?: '',
                        'slug' => $ri_slug,
                        'type' => $ri->type ?: 'custom',
                        'object' => $ri->object ?: 'custom',
                        'object_id' => (int)$ri->object_id,
                        'parent_client_id' => $ri->menu_item_parent ? ('item_' . $ri->menu_item_parent) : null,
                        'parent_id' => (int)$ri->menu_item_parent,
                        'order' => (int)$ri->menu_order,
                        'target' => $ri->target ?: ''
                    );
                }

                if (!$home_item) {
                    $home_item = array(
                        'client_id' => 'item_home',
                        'id' => 0,
                        'title' => 'Trang Chủ',
                        'url' => home_url('/'),
                        'type' => 'custom',
                        'object' => 'custom',
                        'object_id' => 0,
                        'parent_client_id' => null,
                        'parent_id' => 0,
                        'order' => 1,
                        'target' => ''
                    );
                }

                // Cập nhật lại số thứ tự (order) cho các mục con, Trang Chủ luôn là 1
                $ord = 2;
                foreach ($other_items as &$oi) {
                    $oi['order'] = $ord++;
                }
                unset($oi);

                $items = array_merge(array($home_item), $other_items);
            }

            foreach ($locations as $loc => $mid) {
                if ((int)$mid === (int)$selected_menu->term_id) {
                    $assigned_locations[] = $loc;
                }
            }
        }

        // Available theme locations
        $registered_locations = get_registered_nav_menus();

        return rest_ensure_response(array(
            'success' => true,
            'menus' => $menus_list,
            'selected_menu' => $selected_menu ? array(
                'id' => (int)$selected_menu->term_id,
                'name' => $selected_menu->name,
                'slug' => $selected_menu->slug,
                'count' => count($items),
                'locations' => $assigned_locations,
                'items' => $items
            ) : null,
            'styling' => get_option('flatsome_seo_menu_styling') ?: null,
            'available_locations' => $registered_locations
        ));
    }

    /**
     * API 14: Lưu và Cấu hình Menu (Hỗ trợ cấu trúc Cha-Con, Reorder, gán Location Flatsome)
     */
    public function api_save_menu($request) {
        $body = $request->get_json_params() ?: array();
        $menu_id = !empty($body['menu_id']) ? (int)$body['menu_id'] : 0;
        $menu_name = !empty($body['menu_name']) ? sanitize_text_field($body['menu_name']) : 'Main Menu';
        $items = !empty($body['items']) && is_array($body['items']) ? $body['items'] : array();
        $locations = !empty($body['locations']) && is_array($body['locations']) ? $body['locations'] : array('primary', 'primary_mobile');

        // 1. Tìm hoặc tạo Menu
        $target_menu = null;
        if ($menu_id) {
            $target_menu = wp_get_nav_menu_object($menu_id);
        }
        if (!$target_menu) {
            $target_menu = wp_get_nav_menu_object($menu_name);
        }
        if (!$target_menu) {
            $new_menu_id = wp_create_nav_menu($menu_name);
            if (is_wp_error($new_menu_id)) {
                return $new_menu_id;
            }
            $target_menu = wp_get_nav_menu_object($new_menu_id);
        }

        $active_menu_id = (int)$target_menu->term_id;

        // Đổi tên menu nếu người dùng sửa tên
        if ($target_menu->name !== $menu_name) {
            wp_update_term($active_menu_id, 'nav_menu', array('name' => $menu_name));
        }

        // 2. Xóa sạch các items cũ trong menu này
        $old_items = wp_get_nav_menu_items($active_menu_id);
        if (!empty($old_items)) {
            foreach ($old_items as $oi) {
                wp_delete_post($oi->ID, true);
            }
        }

        // 3. Chuẩn hóa danh sách: CHỈ CÓ DUY NHẤT 1 Trang Chủ và luôn neo cố định ở vị trí đầu tiên (#1)
        $clean_items = array();
        $home_item = null;

        foreach ($items as $item) {
            $item_title = !empty($item['title']) ? $item['title'] : '';
            $item_url = !empty($item['url']) ? $item['url'] : '';
            $item_obj_id = !empty($item['object_id']) ? (int)$item['object_id'] : 0;
            $item_slug = !empty($item['slug']) ? $item['slug'] : '';

            if ($this->is_home_nav_item($item_title, $item_url, $item_obj_id, $item_slug)) {
                if (!$home_item) {
                    $home_item = $item;
                    $home_item['title'] = !empty($item_title) ? $item_title : 'Trang Chủ';
                    $home_item['url'] = home_url('/');
                    $home_item['type'] = 'custom';
                    $home_item['object'] = 'custom';
                    $home_item['parent_client_id'] = null;
                }
                // Loại bỏ tất cả các mục Trang Chủ trùng lặp khác
                continue;
            }

            $clean_items[] = $item;
        }

        if (!$home_item) {
            $home_item = array(
                'client_id' => 'home_' . time(),
                'title' => 'Trang Chủ',
                'url' => home_url('/'),
                'type' => 'custom',
                'object' => 'custom',
                'parent_client_id' => null,
            );
        }

        // Luôn gán Trang Chủ ở vị trí đầu tiên
        $items = array_merge(array($home_item), $clean_items);

        // 4. Thêm các items mới
        // Pass 1: Thêm tất cả item và lưu id map: [client_id => wp_db_id]
        $id_map = array();
        $order_counter = 1;

        foreach ($items as $item) {
            $c_id = !empty($item['client_id']) ? $item['client_id'] : ('client_' . $order_counter);
            $item_title = !empty($item['title']) ? sanitize_text_field($item['title']) : 'Liên kết';
            $item_url = !empty($item['url']) ? esc_url_raw($item['url']) : home_url('/');
            if (empty($item_url) && !empty($item['slug'])) {
                $item_url = home_url($item['slug']);
            }
            if ($item_url === '/') {
                $item_url = home_url('/');
            }

            $item_type = !empty($item['type']) ? sanitize_text_field($item['type']) : 'custom';
            $item_object = !empty($item['object']) ? sanitize_text_field($item['object']) : 'custom';
            $item_object_id = !empty($item['object_id']) ? (int)$item['object_id'] : 0;
            $item_target = !empty($item['target']) ? sanitize_text_field($item['target']) : '';

            $menu_item_data = array(
                'menu-item-title' => $item_title,
                'menu-item-url' => $item_url,
                'menu-item-type' => $item_type,
                'menu-item-object' => $item_object,
                'menu-item-object-id' => $item_object_id,
                'menu-item-status' => 'publish',
                'menu-item-position' => $order_counter,
                'menu-item-target' => $item_target,
            );

            $new_db_id = wp_update_nav_menu_item($active_menu_id, 0, $menu_item_data);
            if (!is_wp_error($new_db_id)) {
                $id_map[$c_id] = (int)$new_db_id;
            }
            $order_counter++;
        }

        // Pass 2: Cập nhật phân cấp Cha - Con (Submenu)
        foreach ($items as $item) {
            $c_id = !empty($item['client_id']) ? $item['client_id'] : null;
            $parent_c_id = !empty($item['parent_client_id']) ? $item['parent_client_id'] : null;

            if ($c_id && isset($id_map[$c_id]) && $parent_c_id && isset($id_map[$parent_c_id])) {
                $child_db_id = $id_map[$c_id];
                $parent_db_id = $id_map[$parent_c_id];
                wp_update_nav_menu_item($active_menu_id, $child_db_id, array(
                    'menu-item-parent-id' => $parent_db_id
                ));
            }
        }

        // 4. Gán vị trí menu (Theme locations)
        $theme_locations = get_theme_mod('nav_menu_locations') ?: array();
        foreach ($locations as $loc) {
            $theme_locations[$loc] = $active_menu_id;
        }
        set_theme_mod('nav_menu_locations', $theme_locations);

        // 5. Lưu và biên dịch CSS giao diện Menu nếu có styling
        if (!empty($body['styling']) && is_array($body['styling'])) {
            $styling = $body['styling'];
            update_option('flatsome_seo_menu_styling', $styling);

            // Đồng bộ tùy chọn Header Mobile Sidebar của Flatsome
            $clean_nav_only = !empty($styling['cleanMobileNavOnly']);
            $hide_woo = $clean_nav_only || !isset($styling['mobileHideWooNotice']) || !empty($styling['mobileHideWooNotice']);
            $show_search = !$clean_nav_only && (!isset($styling['mobileShowSearch']) || !empty($styling['mobileShowSearch']));
            $show_social = !$clean_nav_only && (!isset($styling['mobileShowSocial']) || !empty($styling['mobileShowSocial']));
            $show_newsletter = !$clean_nav_only && !empty($styling['mobileShowNewsletter']);

            if ($clean_nav_only) {
                // Chế độ Menu Tinh Gọn 100%: Chỉ giữ lại 'nav', loại bỏ sạch Search, Cart, Newsletter, Social
                $mob_elements = array('nav');
            } else {
                $mob_elements = get_theme_mod('mobile_sidebar');
                if (!is_array($mob_elements) || empty($mob_elements)) {
                    $mob_elements = get_theme_mod('header_mobile_sidebar');
                }
                if (!is_array($mob_elements) || empty($mob_elements)) {
                    $mob_elements = array('nav');
                }

                // Xóa cart và account nếu hide_woo được chọn hoặc site không kích hoạt WooCommerce (loại bỏ triệt để lỗi 'WooCommerce not Found')
                $is_woo = function_exists('is_woocommerce_activated') ? is_woocommerce_activated() : class_exists('WooCommerce');
                if ($hide_woo || !$is_woo) {
                    $mob_elements = array_values(array_diff($mob_elements, array('cart', 'account')));
                }

                // Xử lý Newsletter
                if (!$show_newsletter) {
                    $mob_elements = array_values(array_diff($mob_elements, array('newsletter')));
                } else if (!in_array('newsletter', $mob_elements)) {
                    $mob_elements[] = 'newsletter';
                }

                // Xử lý Search (cả search và search-form)
                if (!$show_search) {
                    $mob_elements = array_values(array_diff($mob_elements, array('search', 'search-form')));
                } else if (!in_array('search', $mob_elements) && !in_array('search-form', $mob_elements)) {
                    array_unshift($mob_elements, 'search');
                }

                // Xử lý Social
                if (!$show_social) {
                    $mob_elements = array_values(array_diff($mob_elements, array('social')));
                } else if (!in_array('social', $mob_elements)) {
                    $mob_elements[] = 'social';
                }

                if (!in_array('nav', $mob_elements)) {
                    $mob_elements[] = 'nav';
                }
            }

            $mob_elements = array_values(array_unique($mob_elements));
            set_theme_mod('mobile_sidebar', $mob_elements);
            set_theme_mod('header_mobile_sidebar', $mob_elements);

            $compiled_css = $this->compile_menu_css($styling);
            update_option('flatsome_seo_menu_custom_css', $compiled_css);
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => "Đã lưu và đồng bộ Menu '{$menu_name}' với " . count($id_map) . " mục lên WordPress thành công!",
            'menu_id' => $active_menu_id,
            'menu_name' => $menu_name,
            'items_count' => count($id_map),
            'locations' => $locations
        ));
    }

    /**
     * Tự động xuất CSS Menu tùy biến vào header của website
     */
    public function inject_menu_custom_css() {
        $css = get_option('flatsome_seo_menu_custom_css');
        $header_css = get_option('flatsome_seo_header_custom_css');
        $layout_fix_css = "
/* Flatsome Full-Width Image & Row Reset (Bảo đảm ảnh tràn viền 100% không bị viền trắng 2 bên) */
.row.row-full-width, .row-full-width {
  max-width: 100% !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.row-full-width > .col, .row-collapse > .col {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-bottom: 0 !important;
}
.row-full-width .col-inner, .row-collapse .col-inner {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.row-full-width .img, .row-full-width .img img, .row-full-width img {
  width: 100% !important;
  max-width: 100% !important;
  display: block !important;
  margin: 0 !important;
}

/* Triệt tiêu thẻ p rỗng hoặc thẻ p chứa comment/br ở đầu trang gây hở trắng */
#content > p:first-child,
.content-area > p:first-child,
#main > p:first-child {
  margin: 0 !important;
  padding: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  line-height: 0 !important;
  font-size: 0 !important;
}
#content > p:empty,
.content-area > p:empty {
  display: none !important;
}

/* Ẩn placeholder 'Assign a menu in Theme Options > Menus' trên Topbar */
#top-bar .nav > li.html > a[href*='customize'],
#top-bar a[href*='nav_menus'],
#top-bar .top-bar-nav > li.html,
#top-bar a:empty {
  display: none !important;
}
";

        $topbar_text = get_theme_mod('topbar_left');
        $topbar_show = get_theme_mod('topbar_show', 1);
        $topbar_hide_css = '';
        if (!$topbar_show || empty($topbar_text)) {
            $topbar_hide_css = "
/* Triệt tiêu hoàn toàn khúc màu xám trên cùng của Header (Topbar) khi không dùng Topbar */
#top-bar, .header-top {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  visibility: hidden !important;
  overflow: hidden !important;
}
";
        }

        echo "\n<!-- Flatsome AutoTheme Custom Menu, Header & Full-Width Styling -->\n<style id=\"flatsome-autotheme-menu-css\">\n" . wp_strip_all_tags($css . "\n" . $header_css . "\n" . $layout_fix_css . "\n" . $topbar_hide_css) . "\n</style>\n";
    }

    public function remove_flatsome_empty_p_tags($content) {
        // Loại bỏ thẻ <p> chứa comment hoặc thẻ <p> rỗng đầu trang
        $content = preg_replace('/<p>\s*<!--(.*?)-->\s*(<br\s*\/?>)?\s*<\/p>/is', '<!--$1-->', $content);
        $content = preg_replace('/<!--\s*FLATSOME_BUILDER_STATE:.*?-->/is', '', $content);
        $content = preg_replace('/^\s*<p>\s*(<br\s*\/?>)?\s*<\/p>\s*/is', '', $content);
        return $content;
    }

    /**
     * Biên dịch bộ cấu hình Màu sắc / Gradient / Dropdown và Mobile Drawer thành mã CSS chuẩn Flatsome
     */
    public function compile_menu_css($styling) {
        $bg_type = !empty($styling['bgType']) ? $styling['bgType'] : 'gradient';
        $bg_color = !empty($styling['bgColor']) ? $styling['bgColor'] : '#1e293b';
        $color1 = !empty($styling['gradientColor1']) ? $styling['gradientColor1'] : '#1e3c72';
        $color2 = !empty($styling['gradientColor2']) ? $styling['gradientColor2'] : '#2a5298';
        $angle = !empty($styling['gradientAngle']) ? $styling['gradientAngle'] : '135deg';

        $text_color = !empty($styling['textColor']) ? $styling['textColor'] : '#ffffff';
        $text_hover = !empty($styling['textHoverColor']) ? $styling['textHoverColor'] : '#60a5fa';
        $item_hover_bg = !empty($styling['itemHoverBg']) ? $styling['itemHoverBg'] : 'rgba(255,255,255,0.1)';
        $font_size = !empty($styling['fontSize']) ? $styling['fontSize'] : '13px';
        $font_weight = !empty($styling['fontWeight']) ? $styling['fontWeight'] : '600';
        $is_uppercase = !empty($styling['isUppercase']);
        $item_radius = !empty($styling['itemRadius']) ? $styling['itemRadius'] : '6px';

        $dropdown_bg = !empty($styling['dropdownBg']) ? $styling['dropdownBg'] : '#1e293b';
        $dropdown_text = !empty($styling['dropdownTextColor']) ? $styling['dropdownTextColor'] : '#f8fafc';
        $dropdown_hover_bg = !empty($styling['dropdownHoverBg']) ? $styling['dropdownHoverBg'] : 'rgba(255,255,255,0.08)';

        // Cấu hình đường viền (Border Top / Bottom / Left / Right)
        $border_style = !empty($styling['borderStyle']) ? $styling['borderStyle'] : 'solid';
        $border_top_w = isset($styling['borderTopWidth']) ? $styling['borderTopWidth'] : '0px';
        $border_top_c = !empty($styling['borderTopColor']) ? $styling['borderTopColor'] : 'transparent';

        $border_bottom_w = isset($styling['borderBottomWidth']) ? $styling['borderBottomWidth'] : '0px';
        $border_bottom_c = !empty($styling['borderBottomColor']) ? $styling['borderBottomColor'] : 'transparent';

        $border_left_w = isset($styling['borderLeftWidth']) ? $styling['borderLeftWidth'] : '0px';
        $border_left_c = !empty($styling['borderLeftColor']) ? $styling['borderLeftColor'] : 'transparent';

        $border_right_w = isset($styling['borderRightWidth']) ? $styling['borderRightWidth'] : '0px';
        $border_right_c = !empty($styling['borderRightColor']) ? $styling['borderRightColor'] : 'transparent';

        $bt_rule = ($border_top_w !== '0px' && $border_top_w !== '0' && !empty($border_top_w)) ? "{$border_top_w} {$border_style} {$border_top_c} !important;" : "none !important;";
        $bb_rule = ($border_bottom_w !== '0px' && $border_bottom_w !== '0' && !empty($border_bottom_w)) ? "{$border_bottom_w} {$border_style} {$border_bottom_c} !important;" : "none !important;";
        $bl_rule = ($border_left_w !== '0px' && $border_left_w !== '0' && !empty($border_left_w)) ? "{$border_left_w} {$border_style} {$border_left_c} !important;" : "none !important;";
        $br_rule = ($border_right_w !== '0px' && $border_right_w !== '0' && !empty($border_right_w)) ? "{$border_right_w} {$border_style} {$border_right_c} !important;" : "none !important;";

        $custom_css = !empty($styling['customCss']) ? $styling['customCss'] : '';

        // Tạo quy tắc nền (Background)
        $bg_rule = 'transparent';
        if ($bg_type === 'gradient') {
            $bg_rule = "linear-gradient({$angle}, {$color1} 0%, {$color2} 100%)";
        } elseif ($bg_type === 'solid') {
            $bg_rule = $bg_color;
        }

        // Cấu hình Mobile Navigation (Off-Canvas Drawer Flatsome)
        $mob_theme = !empty($styling['mobileDrawerTheme']) ? $styling['mobileDrawerTheme'] : 'dark';
        
        $mob_bg = '#0f172a';
        $mob_text = '#f8fafc';
        $mob_hover = '#38bdf8';
        $mob_hover_bg = 'rgba(255, 255, 255, 0.08)';
        $mob_divider = 'rgba(255, 255, 255, 0.08)';
        $mob_sub_bg = '#1e293b';
        $mob_sub_text = '#94a3b8';
        $mob_font_size = !empty($styling['mobileFontSize']) ? $styling['mobileFontSize'] : '14px';

        if ($mob_theme === 'light') {
            $mob_bg = '#ffffff';
            $mob_text = '#0f172a';
            $mob_hover = '#2563eb';
            $mob_hover_bg = 'rgba(0, 0, 0, 0.04)';
            $mob_divider = '#e2e8f0';
            $mob_sub_bg = '#f8fafc';
            $mob_sub_text = '#475569';
        } elseif ($mob_theme === 'match_desktop') {
            $mob_bg = ($bg_type === 'solid') ? $bg_color : $color1;
            $mob_text = $text_color;
            $mob_hover = $text_hover;
            $mob_hover_bg = $item_hover_bg;
            $mob_divider = 'rgba(255, 255, 255, 0.1)';
            $mob_sub_bg = $dropdown_bg;
            $mob_sub_text = $dropdown_text;
        } elseif ($mob_theme === 'custom') {
            $mob_bg = !empty($styling['mobileBgColor']) ? $styling['mobileBgColor'] : '#0f172a';
            $mob_text = !empty($styling['mobileTextColor']) ? $styling['mobileTextColor'] : '#f8fafc';
            $mob_hover = !empty($styling['mobileTextHoverColor']) ? $styling['mobileTextHoverColor'] : '#38bdf8';
            $mob_hover_bg = !empty($styling['mobileHoverBg']) ? $styling['mobileHoverBg'] : 'rgba(255, 255, 255, 0.08)';
            $mob_divider = !empty($styling['mobileDividerColor']) ? $styling['mobileDividerColor'] : 'rgba(255, 255, 255, 0.08)';
            $mob_sub_bg = !empty($styling['mobileSubmenuBg']) ? $styling['mobileSubmenuBg'] : '#1e293b';
            $mob_sub_text = !empty($styling['mobileSubmenuTextColor']) ? $styling['mobileSubmenuTextColor'] : '#94a3b8';
        }

        $clean_nav_only = !empty($styling['cleanMobileNavOnly']);
        $hide_woo = $clean_nav_only || !isset($styling['mobileHideWooNotice']) || !empty($styling['mobileHideWooNotice']);
        $show_search = !$clean_nav_only && (!isset($styling['mobileShowSearch']) || !empty($styling['mobileShowSearch']));
        $show_social = !$clean_nav_only && (!isset($styling['mobileShowSocial']) || !empty($styling['mobileShowSocial']));
        $show_newsletter = !$clean_nav_only && !empty($styling['mobileShowNewsletter']);
        $mob_icon_color = !empty($styling['mobileIconColor']) ? $styling['mobileIconColor'] : '#ffffff';
        $mob_icon_hover = !empty($styling['mobileIconHoverColor']) ? $styling['mobileIconHoverColor'] : '#38bdf8';
        $mob_icon_bg = (!empty($styling['mobileIconBgColor']) && $styling['mobileIconBgColor'] !== 'transparent') ? $styling['mobileIconBgColor'] : 'transparent';

        $css = "
/* Flatsome Header Bottom / Main Menu Bar (Desktop) */
#wide-nav, .header-bottom {
  background: {$bg_rule} !important;
  border-top: {$bt_rule}
  border-bottom: {$bb_rule}
  border-left: {$bl_rule}
  border-right: {$br_rule}
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

/* Menu Top-level Links (Desktop Only - tránh đè vỡ màu trên Mobile Off-canvas Drawer) */
@media (min-width: 850px) {
  #wide-nav .nav > li > a,
  .header-bottom .nav > li > a,
  .header-nav > li > a {
    color: {$text_color} !important;
    font-size: {$font_size} !important;
    font-weight: {$font_weight} !important;
    text-transform: " . ($is_uppercase ? 'uppercase' : 'none') . " !important;
    letter-spacing: 0.03em !important;
    border-radius: {$item_radius} !important;
    padding: 8px 14px !important;
    transition: all 0.2s ease !important;
  }

  /* Menu Item Hover & Active */
  #wide-nav .nav > li > a:hover,
  #wide-nav .nav > li.active > a,
  #wide-nav .nav > li.current-menu-item > a,
  .header-bottom .nav > li > a:hover,
  .header-bottom .nav > li.current-menu-item > a,
  .header-nav > li > a:hover {
    color: {$text_hover} !important;
    background-color: {$item_hover_bg} !important;
  }

  /* Dropdown Submenu Container */
  .nav-dropdown,
  .header-nav .nav-dropdown,
  #wide-nav .nav-dropdown {
    background-color: {$dropdown_bg} !important;
    border-radius: 10px !important;
    box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    padding: 8px !important;
  }

  /* Dropdown Submenu Links */
  .nav-dropdown > li > a,
  .header-nav .nav-dropdown > li > a {
    color: {$dropdown_text} !important;
    font-size: 13px !important;
    border-radius: 6px !important;
    padding: 8px 12px !important;
    transition: all 0.15s ease !important;
  }

  .nav-dropdown > li > a:hover,
  .header-nav .nav-dropdown > li > a:hover {
    color: {$text_hover} !important;
    background-color: {$dropdown_hover_bg} !important;
  }
}

/* ===================================================
   FLATSOME MOBILE OFF-CANVAS DRAWER / SIDEBAR MENU
   =================================================== */

/* Container Drawer Nền Mobile */
#main-menu.mobile-sidebar,
.mobile-sidebar,
.mfp-content .mobile-sidebar,
.mobile-sidebar-levels-1,
.mobile-sidebar.mfp-hide {
  background-color: {$mob_bg} !important;
  color: {$mob_text} !important;
}

/* Các liên kết menu chính trên Mobile Drawer */
.mobile-sidebar .nav-sidebar > li > a,
.mobile-sidebar .sidebar-menu > li > a,
.mobile-sidebar .nav > li > a,
.mobile-sidebar .nav-vertical > li > a,
.mobile-sidebar .nav-sidebar > li.menu-item > a {
  color: {$mob_text} !important;
  font-size: {$mob_font_size} !important;
  font-weight: {$font_weight} !important;
  border-bottom: 1px solid {$mob_divider} !important;
  text-transform: " . ($is_uppercase ? 'uppercase' : 'none') . " !important;
  letter-spacing: 0.02em !important;
  padding: 12px 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  transition: all 0.2s ease !important;
}

/* Viền danh sách mục */
.mobile-sidebar .nav-sidebar > li,
.mobile-sidebar .sidebar-menu > li {
  border-color: {$mob_divider} !important;
}

/* Hiệu ứng Hover & Active trên Mobile */
.mobile-sidebar .nav-sidebar > li > a:hover,
.mobile-sidebar .nav-sidebar > li.active > a,
.mobile-sidebar .nav-sidebar > li.current-menu-item > a,
.mobile-sidebar .sidebar-menu > li > a:hover {
  color: {$mob_hover} !important;
  background-color: {$mob_hover_bg} !important;
}

/* Menu Con Thụt Lề (Submenu) */
.mobile-sidebar .nav-sidebar ul.children,
.mobile-sidebar .nav-sidebar ul.sub-menu {
  background-color: {$mob_sub_bg} !important;
  border-left: 3px solid {$mob_hover} !important;
  margin: 0 !important;
  padding: 4px 0 !important;
}

.mobile-sidebar .nav-sidebar ul.children > li > a,
.mobile-sidebar .nav-sidebar ul.sub-menu > li > a {
  color: {$mob_sub_text} !important;
  font-size: 13px !important;
  padding: 10px 16px 10px 24px !important;
  border-bottom: 1px solid {$mob_divider} !important;
}

.mobile-sidebar .nav-sidebar ul.children > li > a:hover,
.mobile-sidebar .nav-sidebar ul.sub-menu > li > a:hover {
  color: {$mob_hover} !important;
}

/* Nút mũi tên mở menu con */
.mobile-sidebar .toggle {
  color: {$mob_text} !important;
  opacity: 0.7 !important;
}

/* ==============================================================
   Màu Icon Nút Hamburger (3 gạch ☰) trên Header Flatsome Mobile
   ============================================================== */
.header-mobile-toggle i,
.header-mobile-toggle a,
.header-mobile-toggle .icon-menu,
.header-mobile-toggle .icon-menu:before,
.header-mobile-toggle .menu-icon,
.mobile-nav .icon-menu,
.mobile-nav .icon-menu:before,
a[data-open='#main-menu'],
a[data-open='#main-menu'] i,
a[data-open='#main-menu'] .icon-menu,
a[data-open='#main-menu'] .icon-menu:before,
.nav-icon.mobile-nav-icon,
.nav-icon .icon-menu,
.nav-icon .icon-menu:before,
.header-nav .icon-menu,
.header-nav .icon-menu:before,
.header-main .icon-menu,
.header-bottom .icon-menu {
  color: {$mob_icon_color} !important;
  border-color: {$mob_icon_color} !important;
}

/* Các thanh bar vẽ bằng thẻ span */
.header-mobile-toggle .menu-icon span,
.header-mobile-toggle .icon-menu span,
a[data-open='#main-menu'] .menu-icon span,
.nav-icon span {
  background-color: {$mob_icon_color} !important;
}

/* Hiệu ứng khi rê chuột / chạm vào nút Hamburger */
.header-mobile-toggle a:hover,
.header-mobile-toggle a:hover i,
.header-mobile-toggle a:hover .icon-menu,
.header-mobile-toggle a:hover .icon-menu:before,
a[data-open='#main-menu']:hover,
a[data-open='#main-menu']:hover i,
a[data-open='#main-menu']:hover .icon-menu,
a[data-open='#main-menu']:hover .icon-menu:before,
.nav-icon.mobile-nav-icon:hover,
.nav-icon.mobile-nav-icon:hover .icon-menu {
  color: {$mob_icon_hover} !important;
  border-color: {$mob_icon_hover} !important;
}

.header-mobile-toggle a:hover .menu-icon span,
a[data-open='#main-menu']:hover .menu-icon span {
  background-color: {$mob_icon_hover} !important;
}
";

        if ($mob_icon_bg !== 'transparent') {
            $css .= "
.header-mobile-toggle a,
a[data-open='#main-menu'] {
  background-color: {$mob_icon_bg} !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
}
";
        }

        if ($hide_woo) {
            $css .= "
/* Ẩn triệt để thông báo 'WooCommerce not Found' & Giỏ hàng trên Mobile Drawer */
.mobile-sidebar .woocommerce-not-found,
.mobile-sidebar .cart-item,
.mobile-sidebar .header-cart-icon,
.mobile-sidebar .header-cart-link,
.mobile-sidebar .cart-link,
.mobile-sidebar li.header-cart-icon,
.mobile-sidebar li.cart-item,
.mobile-sidebar [class*='cart'],
.mobile-sidebar [class*='woocommerce'],
.mfp-content .woocommerce-not-found,
.mfp-content [class*='cart'],
#main-menu .woocommerce-not-found,
#main-menu .cart-item,
#main-menu .header-cart-icon,
#main-menu [class*='cart'],
#main-menu [class*='woocommerce'] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}
";
        }

        if (!$show_newsletter) {
            $css .= "
/* Ẩn bản tin Newsletter trên Mobile Drawer */
.mobile-sidebar .header-newsletter-item,
.mobile-sidebar .newsletter-link,
.mobile-sidebar [class*='newsletter'],
.mobile-sidebar a[href*='newsletter'],
.mfp-content .header-newsletter-item,
.mfp-content [class*='newsletter'],
#main-menu .header-newsletter-item,
#main-menu [class*='newsletter'] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}
";
        }

        if (!$show_search) {
            $css .= "
/* Ẩn ô Tìm Kiếm trên Mobile Drawer */
.mobile-sidebar .header-search-form,
.mobile-sidebar .searchform,
.mobile-sidebar .header-search,
.mobile-sidebar [class*='search'],
#main-menu .header-search-form,
#main-menu .searchform,
#main-menu [class*='search'] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}
";
        } else {
            $css .= "
/* Tạo kiểu ô Tìm Kiếm chuẩn hiện đại trên Mobile Drawer */
.mobile-sidebar .searchform {
  padding: 12px 14px !important;
}
.mobile-sidebar .searchform input[type='search'],
.mobile-sidebar .searchform input.search-field {
  background-color: " . ($mob_theme === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)') . " !important;
  border: 1px solid {$mob_divider} !important;
  color: {$mob_text} !important;
  border-radius: 6px !important;
}
.mobile-sidebar .searchform input[type='search']::placeholder {
  color: {$mob_sub_text} !important;
  opacity: 0.7 !important;
}
.mobile-sidebar .searchform button[type='submit'] {
  border-radius: 0 6px 6px 0 !important;
}
";
        }

        if (!$show_social) {
            $css .= "
/* Ẩn Icon Mạng Xã Hội trên Mobile Drawer */
.mobile-sidebar .social-icons,
.mobile-sidebar .header-social-icons,
.mobile-sidebar [class*='social'],
#main-menu .social-icons,
#main-menu [class*='social'] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}
";
        } else {
            $css .= "
/* Định kiểu Icon Mạng Xã Hội trên Mobile Drawer */
.mobile-sidebar .social-icons {
  border-top: 1px solid {$mob_divider} !important;
  padding: 14px 16px !important;
  margin-top: 8px !important;
}
.mobile-sidebar .social-icons a {
  color: {$mob_text} !important;
  opacity: 0.85 !important;
  border-color: {$mob_divider} !important;
  transition: all 0.2s ease !important;
}
.mobile-sidebar .social-icons a:hover {
  color: {$mob_hover} !important;
  opacity: 1 !important;
}
";
        }

        if ($clean_nav_only) {
            $css .= "
/* Chế độ Menu Tinh Gọn: Ẩn tất cả các widget khác trong Mobile Drawer ngoài danh sách nav */
.mobile-sidebar .html,
.mobile-sidebar .header-button,
.mobile-sidebar .account-item,
.mobile-sidebar .header-account {
  display: none !important;
}
";
        }

        $css .= "\n/* Custom User CSS */\n{$custom_css}\n";
        return trim($css);
    }
}

// Khởi chạy plugin
add_action('plugins_loaded', array('Flatsome_SEO_Bridge', 'get_instance'));
