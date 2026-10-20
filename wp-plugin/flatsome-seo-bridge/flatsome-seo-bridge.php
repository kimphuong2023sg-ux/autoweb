<?php
/**
 * Plugin Name: Flatsome SEO AutoBridge
 * Plugin URI: https://github.com/seo-tools/flatsome-seo-bridge
 * Description: Plugin kết nối bảo mật cho Tool Auto Theme Flatsome. Cho phép chẩn đoán, dọn dẹp dữ liệu demo, cấu hình Theme Options và triển khai layout UX Builder chuẩn SEO chỉ với 1 click.
 * Version: 1.0.2
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
        add_action('wp_head', array($this, 'render_site_favicon'), 1);
        add_action('admin_head', array($this, 'render_site_favicon'), 1);
        add_action('login_head', array($this, 'render_site_favicon'), 1);
        add_action('init', array($this, 'heal_numeric_theme_mods'));

        // PHP 8+ Safety: Protect Flatsome function-custom-css.php from strict TypeError (int + string)
        add_filter('theme_mod_header_height_transparent', array($this, 'filter_numeric_mod_90'));
        add_filter('theme_mod_header_height', array($this, 'filter_numeric_mod_90'));
        add_filter('theme_mod_header_top_height', array($this, 'filter_numeric_mod_30'));
        add_filter('theme_mod_header_height_sticky', array($this, 'filter_numeric_mod_70'));
        add_filter('theme_mod_header_height_mobile', array($this, 'filter_numeric_mod_70'));
        add_filter('theme_mod_header_bottom_height', array($this, 'filter_numeric_mod_0'));
        // Khắc phục lỗi Flatsome theme_mod_body_bg_image nếu bị lưu dạng số ID thay vì URL ảnh
        add_filter('theme_mod_body_bg_image', array($this, 'filter_body_bg_image'), 20);

        // Mobile Sidebar Safety: Auto-strip 'account' & 'cart' if WooCommerce is not active to prevent 'WooCommerce not Found'
        add_filter('theme_mod_mobile_sidebar', array($this, 'filter_mobile_sidebar'));

        // Anti-wpautop: Strip empty <p> tags and comments from the top of the page content
        add_filter('the_content', array($this, 'remove_flatsome_empty_p_tags'), 11);

        // PHP 8+ Safety: Protect Flatsome UX Builder Elements.php from TypeError: array_push(): Argument #1 ($array) must be of type array, null given
        add_filter('ux_builder_shortcode_data', array($this, 'filter_ux_builder_shortcode_data_safety'), 999);

        // Flatsome AutoTheme: Single Post Layout, Sticky Sidebar, Suggested Posts & Sidebar Widgets
        add_filter('theme_mod_blog_post_layout', array($this, 'filter_blog_post_layout'), 999);
        add_filter('theme_mod_blog_sticky_sidebar', array($this, 'filter_blog_sticky_sidebar'), 999);
        add_filter('the_content', array($this, 'inject_related_posts_to_content'), 95);
        add_action('before_sidebar', array($this, 'inject_custom_sidebar_widgets'), 5);
        add_action('dynamic_sidebar_before', array($this, 'inject_custom_sidebar_widgets'), 5);
        add_action('flatsome_before_sidebar', array($this, 'inject_custom_sidebar_widgets'), 5);

        // Flatsome AutoTheme: Social Share & Post Footer Options
        add_filter('theme_mod_blog_share', array($this, 'filter_blog_share'), 999);
        add_filter('theme_mod_social_icons', array($this, 'filter_social_icons'), 999);
        add_filter('theme_mod_social_icons_style', array($this, 'filter_social_icons_style'), 999);
        add_filter('theme_mod_blog_author_box', array($this, 'filter_blog_author_box'), 999);
        add_filter('theme_mod_blog_single_next_prev_nav', array($this, 'filter_blog_single_next_prev_nav'), 999);
        add_filter('theme_mod_blog_single_footer_meta', array($this, 'filter_blog_single_footer_meta'), 999);
        add_filter('shortcode_atts_share', array($this, 'filter_share_shortcode_atts'), 10, 3);

        // Flatsome AutoTheme: Category / Tag / Author Archive Title Prefix Cleaner (Xóa "Category Archives:")
        add_filter('theme_mod_blog_archive_title', array($this, 'filter_disable_flatsome_default_archive_title'), 999);
        add_action('flatsome_before_blog', array($this, 'render_clean_flatsome_archive_title'), 15);
        add_filter('gettext', array($this, 'filter_remove_archive_title_prefix'), 20, 3);
        add_filter('get_the_archive_title_prefix', '__return_empty_string', 99);
        add_filter('get_the_archive_title', array($this, 'filter_strip_archive_title_prefix'), 99);

        // Flatsome AutoTheme: Ẩn link category nhỏ lặp lại (entry-category) trên từng bài viết ở trang Category & Archive
        add_filter('the_category', array($this, 'filter_remove_entry_category_on_archive'), 99, 3);
        add_filter('the_category_list', array($this, 'filter_remove_entry_category_list_on_archive'), 99, 2);
        add_filter('get_the_categories', array($this, 'filter_remove_entry_category_list_on_archive'), 99, 2);
        add_action('flatsome_before_blog', array($this, 'start_archive_entry_category_buffer'), 20);
        add_action('flatsome_after_blog', array($this, 'end_archive_entry_category_buffer'), 999);
        add_action('wp_footer', array($this, 'end_archive_entry_category_buffer'), 9999);

        // Flatsome AutoTheme: Rank Math & SEO Breadcrumbs Integration
        add_action('flatsome_before_blog', array($this, 'render_rank_math_breadcrumbs'), 10);
        add_action('flatsome_before_page_content', array($this, 'render_rank_math_breadcrumbs_page'), 10);
        add_filter('theme_mod_rank_math_breadcrumb', array($this, 'filter_rank_math_breadcrumb_mod'), 999);
        add_shortcode('autoweb_breadcrumb', array($this, 'shortcode_autoweb_breadcrumb'));
        add_shortcode('flatsome_rank_math_breadcrumb', array($this, 'shortcode_autoweb_breadcrumb'));

        // Flatsome AutoTheme: Button SEO Rel (Nofollow) Guaranteed Output
        add_filter('theme_mod_header_button_1_link_rel', array($this, 'filter_header_button_1_link_rel'), 999);
        add_filter('theme_mod_header_button_2_link_rel', array($this, 'filter_header_button_2_link_rel'), 999);
        add_filter('flatsome_html_atts', array($this, 'filter_flatsome_html_atts_button_rel'), 999);
        add_action('wp_footer', array($this, 'inject_button_rel_fallback_script'), 9999);
    }

    public function filter_ux_builder_shortcode_data_safety($data) {
        if (isset($data['allow_in']) && is_array($data['allow_in'])) {
            // Strip nested / virtual tags (like col_inner, row_inner) that do not exist in Flatsome's elements collection
            $invalid_tags = array('col_inner', 'row_inner', 'section_inner', 'col_inner_1', 'col_inner_2');
            $data['allow_in'] = array_values(array_diff($data['allow_in'], $invalid_tags));
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

    public function filter_body_bg_image($val) {
        if (is_numeric($val) && (int)$val > 0) {
            $url = wp_get_attachment_url((int)$val);
            return $url ?: '';
        }
        return $val;
    }

    public function filter_header_button_1_link_rel($val) {
        $saved = get_option('flatsome_seo_header_button_1_rel', null);
        if ($saved !== null && $saved !== '') return $saved;
        if (!empty($val)) return $val;
        // Tự động gán nofollow nếu là link ngoài / tracking affiliate URL
        $link = get_theme_mod('header_button_1_link');
        if (!empty($link) && (strpos($link, 'http://') === 0 || strpos($link, 'https://') === 0)) {
            $site_host = parse_url(home_url(), PHP_URL_HOST);
            $link_host = parse_url($link, PHP_URL_HOST);
            if ($site_host && $link_host && strtolower($site_host) !== strtolower($link_host)) {
                return 'nofollow';
            }
        }
        return $val;
    }

    public function filter_header_button_2_link_rel($val) {
        $saved = get_option('flatsome_seo_header_button_2_rel', null);
        if ($saved !== null && $saved !== '') return $saved;
        if (!empty($val)) return $val;
        $link = get_theme_mod('header_button_2_link');
        if (!empty($link) && (strpos($link, 'http://') === 0 || strpos($link, 'https://') === 0)) {
            $site_host = parse_url(home_url(), PHP_URL_HOST);
            $link_host = parse_url($link, PHP_URL_HOST);
            if ($site_host && $link_host && strtolower($site_host) !== strtolower($link_host)) {
                return 'nofollow';
            }
        }
        return $val;
    }

    public function filter_flatsome_html_atts_button_rel($atts) {
        if (empty($atts['href'])) return $atts;
        $href = $atts['href'];
        $b1_link = get_theme_mod('header_button_1_link');
        $b2_link = get_theme_mod('header_button_2_link');

        $target_rel = '';
        if (!empty($b1_link) && $href === $b1_link) {
            $target_rel = $this->filter_header_button_1_link_rel(get_theme_mod('header_button_1_link_rel'));
        } elseif (!empty($b2_link) && $href === $b2_link) {
            $target_rel = $this->filter_header_button_2_link_rel(get_theme_mod('header_button_2_link_rel'));
        }

        if (!empty($target_rel)) {
            $existing_rel = !empty($atts['rel']) ? (is_array($atts['rel']) ? $atts['rel'] : explode(' ', $atts['rel'])) : array();
            foreach (explode(' ', $target_rel) as $r) {
                $r = trim($r);
                if ($r && !in_array($r, $existing_rel)) {
                    $existing_rel[] = $r;
                }
            }
            $atts['rel'] = $existing_rel;
        }
        return $atts;
    }

    public function inject_button_rel_fallback_script() {
        ?>
        <script id="flatsome-seo-button-rel-script">
        (function() {
            function applyButtonRel() {
                var buttons = document.querySelectorAll('.header-button-1 a, .header-button-2 a');
                buttons.forEach(function(a) {
                    var href = a.getAttribute('href');
                    if (href && (href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('//') === 0)) {
                        try {
                            var linkHost = new URL(href, window.location.origin).hostname;
                            if (linkHost && linkHost !== window.location.hostname) {
                                var rel = (a.getAttribute('rel') || '').trim();
                                if (rel.indexOf('nofollow') === -1) {
                                    a.setAttribute('rel', rel ? rel + ' nofollow' : 'nofollow');
                                }
                            }
                        } catch(e) {}
                    }
                });
            }
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', applyButtonRel);
            } else {
                applyButtonRel();
            }
        })();
        </script>
        <?php
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
        $curr_preset = get_theme_mod('header_preset');
        $is_wide_nav = ($curr_preset === 'header-wide-nav-dark' || $curr_preset === 'header-wide-nav' || empty($curr_preset));

        if ($is_wide_nav && (empty($bot) || !is_numeric($bot) || (int)$bot < 30)) {
            set_theme_mod('header_bottom_height', 45);
            $bot = 45;
        } elseif ($bot === '' || is_array($bot)) {
            remove_theme_mod('header_bottom_height');
        }

        // Tự động bảo đảm Menu điều hướng chính (nav) luôn hiển thị 100%:
        if (!empty($bot) && (int)$bot > 0) {
            $bl = (array) get_theme_mod('header_elements_bottom_left', array());
            $bc = (array) get_theme_mod('header_elements_bottom_center', array());
            $br = (array) get_theme_mod('header_elements_bottom_right', array());
            if (!in_array('nav', $bl) && !in_array('nav', $bc) && !in_array('nav', $br)) {
                $bl[] = 'nav';
                set_theme_mod('header_elements_bottom_left', array_values($bl));
            }
            if (!get_theme_mod('nav_position_color')) {
                set_theme_mod('nav_position_color', 'dark');
            }
            if (!get_theme_mod('nav_position_bg')) {
                $pri = get_theme_mod('color_primary') ?: '#0f3a61';
                set_theme_mod('nav_position_bg', $pri);
            }
        }

        // Tự động khôi phục body_bg_image về URL nếu bị lưu nhầm dạng số ID
        $body_bg_img = get_theme_mod('body_bg_image');
        if (is_numeric($body_bg_img) && (int)$body_bg_img > 0) {
            $real_url = wp_get_attachment_url((int)$body_bg_img);
            if ($real_url) {
                set_theme_mod('body_bg_image', $real_url);
            } else {
                remove_theme_mod('body_bg_image');
            }
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

        register_rest_route(self::API_NAMESPACE, '/install-theme', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_install_theme'),
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

        register_rest_route(self::API_NAMESPACE, '/save-subpage-styling', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_save_subpage_styling'),
            'permission_callback' => array($this, 'check_auth')
        ));

        register_rest_route(self::API_NAMESPACE, '/set-favicon', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_set_favicon'),
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
            'site_logo' => !empty($theme_mods['site_logo']) ? (is_numeric($theme_mods['site_logo']) ? wp_get_attachment_url($theme_mods['site_logo']) : $theme_mods['site_logo']) : '',
            'site_logo_id' => !empty($theme_mods['site_logo']) && is_numeric($theme_mods['site_logo']) ? (int)$theme_mods['site_logo'] : 0,
            'site_logo_dark' => !empty($theme_mods['site_logo_dark']) ? (is_numeric($theme_mods['site_logo_dark']) ? wp_get_attachment_url($theme_mods['site_logo_dark']) : $theme_mods['site_logo_dark']) : '',
            'site_logo_dark_id' => !empty($theme_mods['site_logo_dark']) && is_numeric($theme_mods['site_logo_dark']) ? (int)$theme_mods['site_logo_dark'] : 0,
            'site_logo_sticky' => !empty($theme_mods['site_logo_sticky']) ? (is_numeric($theme_mods['site_logo_sticky']) ? wp_get_attachment_url($theme_mods['site_logo_sticky']) : $theme_mods['site_logo_sticky']) : '',
            'site_logo_sticky_id' => !empty($theme_mods['site_logo_sticky']) && is_numeric($theme_mods['site_logo_sticky']) ? (int)$theme_mods['site_logo_sticky'] : 0,
            'logo_width' => !empty($theme_mods['logo_width']) ? (int)$theme_mods['logo_width'] : 200,
            'logo_max_width' => !empty($theme_mods['logo_max_width']) ? $theme_mods['logo_max_width'] : '',
            'logo_padding' => isset($theme_mods['logo_padding']) ? (int)$theme_mods['logo_padding'] : 0,
            'logo_position' => !empty($theme_mods['logo_position']) ? $theme_mods['logo_position'] : 'left',
            'site_icon' => get_option('site_icon') ? (int)get_option('site_icon') : 0,
            'site_icon_url' => get_site_icon_url() ?: (get_option('site_icon') ? wp_get_attachment_image_url(get_option('site_icon'), 'full') : ''),
            'box_shadow' => !empty($theme_mods['box_shadow']) ? $theme_mods['box_shadow'] : false,
            'layout' => !empty($theme_mods['layout']) ? $theme_mods['layout'] : 'full-width',
            'default_page_template' => !empty($theme_mods['default_page_template']) ? $theme_mods['default_page_template'] : 'default',

            // Native Header Builder Element Slots
            'topbar_elements_left' => !empty($theme_mods['topbar_elements_left']) ? (array)$theme_mods['topbar_elements_left'] : array(),
            'topbar_elements_center' => !empty($theme_mods['topbar_elements_center']) ? (array)$theme_mods['topbar_elements_center'] : array(),
            'topbar_elements_right' => !empty($theme_mods['topbar_elements_right']) ? (array)$theme_mods['topbar_elements_right'] : array(),
            'header_elements_left' => !empty($theme_mods['header_elements_left']) ? (array)$theme_mods['header_elements_left'] : array(),
            'header_elements_center' => !empty($theme_mods['header_elements_center']) ? (array)$theme_mods['header_elements_center'] : array(),
            'header_elements_right' => !empty($theme_mods['header_elements_right']) ? (array)$theme_mods['header_elements_right'] : array(),
            'header_elements_bottom_left' => !empty($theme_mods['header_elements_bottom_left']) ? (array)$theme_mods['header_elements_bottom_left'] : array(),
            'header_elements_bottom_center' => !empty($theme_mods['header_elements_bottom_center']) ? (array)$theme_mods['header_elements_bottom_center'] : array(),
            'header_elements_bottom_right' => !empty($theme_mods['header_elements_bottom_right']) ? (array)$theme_mods['header_elements_bottom_right'] : array(),

            // Content for elements
            'topbar_left' => !empty($theme_mods['topbar_left']) ? $theme_mods['topbar_left'] : '',
            'topbar_right' => !empty($theme_mods['topbar_right']) ? $theme_mods['topbar_right'] : '',
            'top_right_text' => !empty($theme_mods['top_right_text']) ? $theme_mods['top_right_text'] : '',
            'nav_position_text_top' => !empty($theme_mods['nav_position_text_top']) ? $theme_mods['nav_position_text_top'] : '',
            'nav_position_text' => !empty($theme_mods['nav_position_text']) ? $theme_mods['nav_position_text'] : '',
            'contact_phone' => !empty($theme_mods['contact_phone']) ? $theme_mods['contact_phone'] : '',
            'contact_email' => !empty($theme_mods['contact_email']) ? $theme_mods['contact_email'] : '',
            'contact_location' => !empty($theme_mods['contact_location']) ? $theme_mods['contact_location'] : '',
            'contact_hours' => !empty($theme_mods['contact_hours']) ? $theme_mods['contact_hours'] : '',
            'header_block_1' => !empty($theme_mods['header-block-1']) ? $theme_mods['header-block-1'] : '',
            'header_block_2' => !empty($theme_mods['header-block-2']) ? $theme_mods['header-block-2'] : '',
            'header_block_3' => !empty($theme_mods['header-block-3']) ? $theme_mods['header-block-3'] : '',
            'header_block_4' => !empty($theme_mods['header-block-4']) ? $theme_mods['header-block-4'] : '',

            // Buttons (CTA 1 & 2)
            'header_button_1' => isset($theme_mods['header_button_1']) ? $theme_mods['header_button_1'] : (get_theme_mod('header_button_1', '') ?: ''),
            'header_button_1_link' => isset($theme_mods['header_button_1_link']) ? $theme_mods['header_button_1_link'] : (get_theme_mod('header_button_1_link', '') ?: ''),
            'header_button_1_link_target' => isset($theme_mods['header_button_1_link_target']) ? $theme_mods['header_button_1_link_target'] : (get_theme_mod('header_button_1_link_target', '_self') ?: '_self'),
            'header_button_1_link_rel' => isset($theme_mods['header_button_1_link_rel']) ? $theme_mods['header_button_1_link_rel'] : (get_theme_mod('header_button_1_link_rel', '') ?: ''),
            'header_button_1_color' => isset($theme_mods['header_button_1_color']) ? $theme_mods['header_button_1_color'] : (get_theme_mod('header_button_1_color', 'primary') ?: 'primary'),
            'header_button_1_style' => isset($theme_mods['header_button_1_style']) ? $theme_mods['header_button_1_style'] : (get_theme_mod('header_button_1_style', 'is-flat') ?: 'is-flat'),
            'header_button_1_radius' => isset($theme_mods['header_button_1_radius']) ? $theme_mods['header_button_1_radius'] : (get_theme_mod('header_button_1_radius', '99px') ?: '99px'),

            'header_button_2' => isset($theme_mods['header_button_2']) ? $theme_mods['header_button_2'] : (get_theme_mod('header_button_2', '') ?: ''),
            'header_button_2_link' => isset($theme_mods['header_button_2_link']) ? $theme_mods['header_button_2_link'] : (get_theme_mod('header_button_2_link', '') ?: ''),
            'header_button_2_link_target' => isset($theme_mods['header_button_2_link_target']) ? $theme_mods['header_button_2_link_target'] : (get_theme_mod('header_button_2_link_target', '_self') ?: '_self'),
            'header_button_2_link_rel' => isset($theme_mods['header_button_2_link_rel']) ? $theme_mods['header_button_2_link_rel'] : (get_theme_mod('header_button_2_link_rel', '') ?: ''),
            'header_button_2_color' => isset($theme_mods['header_button_2_color']) ? $theme_mods['header_button_2_color'] : (get_theme_mod('header_button_2_color', 'secondary') ?: 'secondary'),
            'header_button_2_style' => isset($theme_mods['header_button_2_style']) ? $theme_mods['header_button_2_style'] : (get_theme_mod('header_button_2_style', 'is-flat') ?: 'is-flat'),
            'header_button_2_radius' => isset($theme_mods['header_button_2_radius']) ? $theme_mods['header_button_2_radius'] : (get_theme_mod('header_button_2_radius', '99px') ?: '99px'),
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
                'has_flatsome_installed' => wp_get_theme('flatsome')->exists(),
                'admin_email' => get_bloginfo('admin_email'),
                'permalink_structure' => get_option('permalink_structure'),
                'site_icon' => get_option('site_icon') ? (int)get_option('site_icon') : 0,
                'site_icon_url' => get_site_icon_url() ?: (get_option('site_icon') ? wp_get_attachment_image_url(get_option('site_icon'), 'full') : ''),
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
            'ux_blocks' => $ux_blocks_list,
            'subpage_styling' => get_option('flatsome_seo_subpage_styling', null)
        ));
    }

    /**
     * API: Install & Activate Flatsome Theme (Hỗ trợ Chunked Base64, Kích hoạt trực tiếp & Giải nén dự phòng)
     */
    public function api_install_theme($request) {
        $body = $request->get_json_params() ?: array();

        // 1. Nếu theme Flatsome đã tồn tại trong thư mục themes, kích hoạt ngay lập tức
        $theme_flatsome = wp_get_theme('flatsome');
        if ($theme_flatsome->exists()) {
            switch_theme('flatsome');
            $active_theme = wp_get_theme();
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Theme Flatsome đã có sẵn trên website và đã được kích hoạt thành công!',
                'is_flatsome' => true,
                'theme' => $active_theme->get('Name'),
                'theme_version' => $active_theme->get('Version')
            ));
        }

        if (!empty($body['check_only'])) {
            return rest_ensure_response(array(
                'success' => false,
                'is_flatsome' => false,
                'message' => 'Theme Flatsome chưa có trên website, cần tải lên.'
            ));
        }

        // 2. Nhận file zip tải lên (hỗ trợ chunked base64, single base64, hoặc file multipart)
        $zip_file = null;
        $files = $request->get_file_params();

        // 2.1 Hỗ trợ tải lên theo từng Chunk (khắc phục 100% giới hạn post_max_size / timeout của hosting)
        if (isset($body['chunk_index']) && isset($body['total_chunks'])) {
            $chunk_index = (int)$body['chunk_index'];
            $total_chunks = (int)$body['total_chunks'];
            $file_id = !empty($body['chunk_file_id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $body['chunk_file_id']) : 'flatsome_v3185';
            
            $temp_dir = get_temp_dir();
            $target_chunk_file = trailingslashit($temp_dir) . 'flatsome_install_' . $file_id . '.zip';

            // Xóa file cũ nếu bắt đầu từ chunk 0
            if ($chunk_index === 0 && file_exists($target_chunk_file)) {
                @unlink($target_chunk_file);
            }

            if (!empty($body['chunk_base64'])) {
                $chunk_data = base64_decode($body['chunk_base64']);
                file_put_contents($target_chunk_file, $chunk_data, FILE_APPEND);
            }

            // Nếu chưa phải chunk cuối cùng, phản hồi tiến độ
            if ($chunk_index + 1 < $total_chunks) {
                return rest_ensure_response(array(
                    'success' => true,
                    'is_partial' => true,
                    'chunk_index' => $chunk_index,
                    'total_chunks' => $total_chunks,
                    'progress' => round((($chunk_index + 1) / $total_chunks) * 100),
                    'message' => 'Đang truyền khối ' . ($chunk_index + 1) . '/' . $total_chunks
                ));
            }

            // Đã nhận đủ tất cả các chunk:
            $zip_file = $target_chunk_file;
        } elseif (!empty($files['themezip']['tmp_name'])) {
            $zip_file = $files['themezip']['tmp_name'];
        } elseif (!empty($body['zip_base64'])) {
            $tmp = wp_tempnam('flatsome.zip');
            file_put_contents($tmp, base64_decode($body['zip_base64']));
            $zip_file = $tmp;
        }

        if (!$zip_file || !file_exists($zip_file) || filesize($zip_file) < 1000) {
            return new WP_Error('no_zip', 'Không tìm thấy hoặc gói cài đặt zip không hợp lệ.', array('status' => 400));
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/theme.php';
        WP_Filesystem();

        $theme_root = get_theme_root();
        $unzip_result = unzip_file($zip_file, $theme_root);

        // Fallback: Thử giải nén bằng ZipArchive nếu unzip_file gặp lỗi quyền hoặc WP_Filesystem
        if (is_wp_error($unzip_result) && class_exists('ZipArchive')) {
            $zip = new ZipArchive();
            if ($zip->open($zip_file) === true) {
                $zip->extractTo($theme_root);
                $zip->close();
                $unzip_result = true;
            }
        }

        if (file_exists($zip_file)) {
            @unlink($zip_file);
        }

        if (is_wp_error($unzip_result)) {
            return new WP_Error('unzip_failed', 'Lỗi khi giải nén theme Flatsome: ' . $unzip_result->get_error_message(), array('status' => 500));
        }

        // 3. Kích hoạt theme Flatsome
        switch_theme('flatsome');
        $activated_theme = wp_get_theme();

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Đã tải lên, giải nén và kích hoạt hoàn thiện Theme Flatsome thành công 100%!',
            'is_flatsome' => true,
            'theme' => $activated_theme->get('Name'),
            'theme_version' => $activated_theme->get('Version')
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
        // 1. Luôn bảo vệ Trang Chủ Flatsome: Phải là page-blank.php (tránh lỗi đóng khung hộp default và hiện tiêu đề h1 thừa)
        $front_id = (int) get_option('page_on_front');
        if ($front_id) {
            update_post_meta($front_id, '_wp_page_template', 'page-blank.php');
        }

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
        if (isset($body['site_icon_id'])) {
            $s_icon = (int)$body['site_icon_id'];
            if ($s_icon > 0) {
                update_option('site_icon', $s_icon);
                set_theme_mod('site_icon', $s_icon);
            } else {
                update_option('site_icon', 0);
                remove_theme_mod('site_icon');
            }
        }

        // Flatsome Site Logo Options
        if (isset($body['site_logo'])) {
            $logo_val = !empty($body['site_logo_id']) ? (int)$body['site_logo_id'] : sanitize_text_field($body['site_logo']);
            if (empty($logo_val)) {
                remove_theme_mod('site_logo');
            } else {
                set_theme_mod('site_logo', $logo_val);
            }
        }
        if (isset($body['site_logo_dark'])) {
            $logo_dark_val = !empty($body['site_logo_dark_id']) ? (int)$body['site_logo_dark_id'] : sanitize_text_field($body['site_logo_dark']);
            if (empty($logo_dark_val)) {
                remove_theme_mod('site_logo_dark');
            } else {
                set_theme_mod('site_logo_dark', $logo_dark_val);
            }
        }
        if (isset($body['site_logo_sticky'])) {
            $logo_sticky_val = !empty($body['site_logo_sticky_id']) ? (int)$body['site_logo_sticky_id'] : sanitize_text_field($body['site_logo_sticky']);
            if (empty($logo_sticky_val)) {
                remove_theme_mod('site_logo_sticky');
            } else {
                set_theme_mod('site_logo_sticky', $logo_sticky_val);
            }
        }
        if (isset($body['logo_width'])) {
            set_theme_mod('logo_width', (int)$body['logo_width']);
        }
        if (isset($body['logo_max_width'])) {
            set_theme_mod('logo_max_width', sanitize_text_field($body['logo_max_width']));
        }
        if (isset($body['logo_padding'])) {
            set_theme_mod('logo_padding', (int)$body['logo_padding']);
        }
        if (isset($body['logo_position'])) {
            set_theme_mod('logo_position', sanitize_text_field($body['logo_position']));
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

            // Đảm bảo Trang Chủ trong Flatsome LUÔN LUÔN là page-blank.php (Tràn viền 100%, không bị đóng khung hộp default và không bị hiện tiêu đề h1 thừa)
            $front_id = (int) get_option('page_on_front');
            if ($front_id) {
                update_post_meta($front_id, '_wp_page_template', 'page-blank.php');
            }
        }
        if (!empty($body['layout'])) {
            set_theme_mod('layout', sanitize_text_field($body['layout']));
        }

        // Luôn bảo đảm Trang Chủ là page-blank.php
        $front_id = (int) get_option('page_on_front');
        if ($front_id) {
            update_post_meta($front_id, '_wp_page_template', 'page-blank.php');
        }

        // ==========================================
        // SITE-WIDE BACKGROUND (COLOR, GRADIENT, IMAGE)
        // ==========================================
        if (isset($body['site_bg_type'])) {
            $site_bg_type = sanitize_text_field($body['site_bg_type']);
            $site_bg_css = '';

            if ($site_bg_type === 'color') {
                $bg_color = !empty($body['site_bg_color']) ? sanitize_hex_color($body['site_bg_color']) : '#ffffff';
                if ($bg_color) {
                    set_theme_mod('body_bg', $bg_color);
                    remove_theme_mod('body_bg_image');
                    $site_bg_css = "\n/* Flatsome AutoTheme: Site-wide Solid Background */\nhtml, body {\n  background-color: {$bg_color} !important;\n  background-image: none !important;\n}\n#wrapper {\n  background-color: transparent !important;\n  background: transparent !important;\n}\n#main, #content, .page-wrapper, .content-area, .entry-content,\n#main section.section, #main .section-bg, #content section.section, #content .section-bg {\n  background-color: transparent !important;\n}\n";
                }
            } elseif ($site_bg_type === 'gradient') {
                $c1 = !empty($body['site_bg_gradient_color1']) ? sanitize_hex_color($body['site_bg_gradient_color1']) : '#0f172a';
                $c2 = !empty($body['site_bg_gradient_color2']) ? sanitize_hex_color($body['site_bg_gradient_color2']) : '#1e293b';
                $angle = isset($body['site_bg_gradient_angle']) ? (int)$body['site_bg_gradient_angle'] : 135;
                $gtype = !empty($body['site_bg_gradient_type']) ? sanitize_text_field($body['site_bg_gradient_type']) : 'linear';

                if ($gtype === 'radial') {
                    $grad_rule = "radial-gradient(circle at center, {$c1} 0%, {$c2} 100%)";
                } else {
                    $grad_rule = "linear-gradient({$angle}deg, {$c1} 0%, {$c2} 100%)";
                }

                if ($c1) {
                    set_theme_mod('body_bg', $c1);
                }
                remove_theme_mod('body_bg_image');

                $site_bg_css = "\n/* Flatsome AutoTheme: Site-wide Gradient Background */\nhtml, body {\n  background: {$grad_rule} !important;\n  background-attachment: fixed !important;\n}\n#wrapper {\n  background-color: transparent !important;\n  background: transparent !important;\n}\n#main, #content, .page-wrapper, .content-area, .entry-content,\n#main section.section, #main .section-bg, #content section.section, #content .section-bg {\n  background-color: transparent !important;\n}\n";
            } elseif ($site_bg_type === 'image') {
                $img_url = !empty($body['site_bg_image']) ? esc_url_raw($body['site_bg_image']) : '';
                $img_id = !empty($body['site_bg_image_id']) ? (int)$body['site_bg_image_id'] : 0;
                $repeat = !empty($body['site_bg_image_repeat']) ? sanitize_text_field($body['site_bg_image_repeat']) : 'no-repeat';
                $size = !empty($body['site_bg_image_size']) ? sanitize_text_field($body['site_bg_image_size']) : 'cover';
                $position = !empty($body['site_bg_image_position']) ? sanitize_text_field($body['site_bg_image_position']) : 'center center';
                $attachment = !empty($body['site_bg_image_attachment']) ? sanitize_text_field($body['site_bg_image_attachment']) : 'fixed';
                $overlay_enable = !empty($body['site_bg_overlay_enable']);
                $overlay_color = !empty($body['site_bg_overlay_color']) ? sanitize_text_field($body['site_bg_overlay_color']) : 'rgba(0, 0, 0, 0.45)';

                if ($img_url) {
                    set_theme_mod('body_bg_image', $img_url);
                } else if ($img_id > 0) {
                    $resolved_url = wp_get_attachment_url($img_id);
                    if ($resolved_url) {
                        $img_url = $resolved_url;
                        set_theme_mod('body_bg_image', $resolved_url);
                    }
                }

                if ($img_url) {
                    if ($overlay_enable && !empty($overlay_color)) {
                        $bg_img_rule = "linear-gradient({$overlay_color}, {$overlay_color}), url('{$img_url}')";
                    } else {
                        $bg_img_rule = "url('{$img_url}')";
                    }

                    $site_bg_css = "\n/* Flatsome AutoTheme: Site-wide Background Image */\nhtml, body {\n  background-image: {$bg_img_rule} !important;\n  background-repeat: {$repeat} !important;\n  background-size: {$size} !important;\n  background-position: {$position} !important;\n  background-attachment: {$attachment} !important;\n  background-color: #0b0f19 !important;\n}\n#wrapper {\n  background-color: transparent !important;\n  background: transparent !important;\n}\n#main, #content, .page-wrapper, .content-area, .entry-content,\n#main section.section, #main .section-bg, #content section.section, #content .section-bg {\n  background-color: transparent !important;\n}\n";
                }
            }

            // Tự động tối ưu độ tương phản cho tiêu đề và chữ trên nền tối
            $is_dark = ($site_bg_type === 'image')
                || ($site_bg_type === 'gradient' && (!isset($c1) || $c1 !== '#f8fafc'))
                || ($site_bg_type === 'color' && isset($bg_color) && in_array(strtolower($bg_color), array('#0f172a', '#0a0f1d', '#111827', '#05070a', '#0a192f', '#1a1614', '#000000')));

            if ($is_dark && !empty($site_bg_css)) {
                $site_bg_css .= "\n/* Flatsome AutoTheme: High Contrast Text on Dark Background */\n#main section.section:not(.dark) .section-title-main {\n  color: #f8fafc !important;\n  text-shadow: 0 2px 4px rgba(0,0,0,0.8);\n}\n#main section.section:not(.dark) .text p,\n#main section.section:not(.dark) p {\n  color: #e2e8f0 !important;\n  text-shadow: 0 1px 3px rgba(0,0,0,0.7);\n}\n";
            }

            update_option('flatsome_seo_site_bg_css', $site_bg_css);
        }

        // ==========================================
        // ==========================================
        // FLATSOME HEADER CONFIGURATION & PRESETS
        // ==========================================
        if (!empty($body['header_preset'])) {
            $preset_id = sanitize_text_field($body['header_preset']);

            if ($preset_id === 'header-wide-nav-dark') {
                // Preset 1: Wide Nav Dark (Chuẩn Casino, Thể Thao, Juega365)
                // 1. Tắt Topbar nếu không có text cụ thể
                if (empty($body['topbar_text'])) {
                    set_theme_mod('topbar_show', 0);
                    set_theme_mod('topbar_left', '');
                    set_theme_mod('topbar_right', '');
                    set_theme_mod('topbar_elements_left', array());
                    set_theme_mod('topbar_elements_center', array());
                    set_theme_mod('topbar_elements_right', array());
                }

                // 2. Thanh chính: Logo bên trái, 2 Nút CTA đỏ bên phải
                $h_width = !empty($body['header_width']) ? sanitize_text_field($body['header_width']) : 'container';
                set_theme_mod('header_width', $h_width);
                $h_height = !empty($body['header_height']) ? (int)$body['header_height'] : 90;
                set_theme_mod('header_height', $h_height);
                set_theme_mod('header_height_transparent', $h_height);
                set_theme_mod('header_color', 'dark');
                set_theme_mod('header_bg', !empty($body['header_bg']) ? sanitize_text_field($body['header_bg']) : '#161616');
                set_theme_mod('logo_position', 'left');
                set_theme_mod('header_elements_left', array());
                set_theme_mod('header_elements_right', array('button-1', 'button-2'));

                // 3. Thanh dưới: Chiều cao 45px, Menu dàn ngang sắc nét
                $b_height = !empty($body['header_bottom_height']) ? (int)$body['header_bottom_height'] : 45;
                set_theme_mod('header_bottom_height', $b_height);
                $b_bg = !empty($body['header_bottom_bg']) ? sanitize_text_field($body['header_bottom_bg']) : (!empty($body['color_primary']) ? sanitize_hex_color($body['color_primary']) : '#0f3a61');
                set_theme_mod('nav_position_bg', $b_bg);
                set_theme_mod('nav_position_color', 'dark');
                set_theme_mod('header_elements_bottom_left', array('nav'));
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

                // 4. Cấu hình 2 nút CTA chuẩn Casino
                $btn1_text = !empty($body['header_button_1']) ? sanitize_text_field($body['header_button_1']) : (get_theme_mod('header_button_1') ?: 'REGÍSTRATE');
                $btn2_text = !empty($body['header_button_2']) ? sanitize_text_field($body['header_button_2']) : (get_theme_mod('header_button_2') ?: 'ENTRAR');
                set_theme_mod('header_button_1', $btn1_text);
                set_theme_mod('header_button_1_link', !empty($body['header_button_1_link']) ? esc_url_raw($body['header_button_1_link']) : '#register');
                set_theme_mod('header_button_1_color', !empty($body['header_button_1_color']) ? sanitize_text_field($body['header_button_1_color']) : 'alert');
                set_theme_mod('header_button_1_style', !empty($body['header_button_1_style']) ? sanitize_text_field($body['header_button_1_style']) : 'is-flat');
                set_theme_mod('header_button_1_radius', !empty($body['header_button_1_radius']) ? sanitize_text_field($body['header_button_1_radius']) : '99px');

                set_theme_mod('header_button_2', $btn2_text);
                set_theme_mod('header_button_2_link', !empty($body['header_button_2_link']) ? esc_url_raw($body['header_button_2_link']) : '#login');
                set_theme_mod('header_button_2_color', !empty($body['header_button_2_color']) ? sanitize_text_field($body['header_button_2_color']) : 'alert');
                set_theme_mod('header_button_2_style', !empty($body['header_button_2_style']) ? sanitize_text_field($body['header_button_2_style']) : 'is-flat');
                set_theme_mod('header_button_2_radius', !empty($body['header_button_2_radius']) ? sanitize_text_field($body['header_button_2_radius']) : '99px');

            } elseif ($preset_id === 'header-wide-nav') {
                if (empty($body['topbar_text'])) {
                    set_theme_mod('topbar_show', 0);
                    set_theme_mod('topbar_left', '');
                    set_theme_mod('topbar_right', '');
                    set_theme_mod('topbar_elements_left', array());
                    set_theme_mod('topbar_elements_center', array());
                    set_theme_mod('topbar_elements_right', array());
                }
                $h_width = !empty($body['header_width']) ? sanitize_text_field($body['header_width']) : 'container';
                set_theme_mod('header_width', $h_width);
                $h_height = !empty($body['header_height']) ? (int)$body['header_height'] : 90;
                set_theme_mod('header_height', $h_height);
                set_theme_mod('header_height_transparent', $h_height);
                set_theme_mod('header_color', 'light');
                set_theme_mod('header_bg', !empty($body['header_bg']) ? sanitize_text_field($body['header_bg']) : '#ffffff');
                set_theme_mod('logo_position', 'left');
                set_theme_mod('header_elements_left', array());
                set_theme_mod('header_elements_right', array('button-1', 'button-2'));

                $b_height = !empty($body['header_bottom_height']) ? (int)$body['header_bottom_height'] : 45;
                set_theme_mod('header_bottom_height', $b_height);
                $b_bg = !empty($body['header_bottom_bg']) ? sanitize_text_field($body['header_bottom_bg']) : '#334155';
                set_theme_mod('nav_position_bg', $b_bg);
                set_theme_mod('nav_position_color', 'dark');
                set_theme_mod('header_elements_bottom_left', array('nav'));
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

            } elseif ($preset_id === 'header-simple-signup') {
                if (empty($body['topbar_text'])) set_theme_mod('topbar_show', 0);
                set_theme_mod('header_height', !empty($body['header_height']) ? (int)$body['header_height'] : 84);
                set_theme_mod('header_color', 'light');
                set_theme_mod('header_bg', !empty($body['header_bg']) ? sanitize_text_field($body['header_bg']) : '#ffffff');
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_left', array('nav'));
                set_theme_mod('header_elements_right', array('button-1', 'button-2'));
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

            } elseif ($preset_id === 'header-simple-right-buttons') {
                if (empty($body['topbar_text'])) set_theme_mod('topbar_show', 0);
                set_theme_mod('header_height', !empty($body['header_height']) ? (int)$body['header_height'] : 84);
                set_theme_mod('header_color', 'light');
                set_theme_mod('header_bg', !empty($body['header_bg']) ? sanitize_text_field($body['header_bg']) : '#ffffff');
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_left', array());
                set_theme_mod('header_elements_right', array('nav', 'search', 'button-1'));
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

            } elseif ($preset_id === 'header-default-center') {
                if (empty($body['topbar_text'])) set_theme_mod('topbar_show', 0);
                set_theme_mod('header_height', !empty($body['header_height']) ? (int)$body['header_height'] : 90);
                set_theme_mod('logo_position', 'center');
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_left', array('nav'));
                set_theme_mod('header_elements_right', array('search', 'account', 'cart'));
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

            } elseif ($preset_id === 'header-default-dark') {
                if (empty($body['topbar_text'])) set_theme_mod('topbar_show', 0);
                set_theme_mod('header_height', !empty($body['header_height']) ? (int)$body['header_height'] : 90);
                set_theme_mod('header_color', 'dark');
                set_theme_mod('header_bg', !empty($body['header_bg']) ? sanitize_text_field($body['header_bg']) : '#161616');
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_left', array('nav'));
                set_theme_mod('header_elements_right', array('search', 'account', 'cart'));
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

            } elseif ($preset_id === 'header-simple') {
                if (empty($body['topbar_text'])) set_theme_mod('topbar_show', 0);
                set_theme_mod('header_height', !empty($body['header_height']) ? (int)$body['header_height'] : 84);
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_left', array());
                set_theme_mod('header_elements_right', array('search', 'menu-icon'));
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

            } elseif ($preset_id === 'header-cart-top') {
                set_theme_mod('topbar_show', 1);
                set_theme_mod('topbar_elements_right', array('account', 'cart'));
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_left', array());
                set_theme_mod('header_elements_right', array('nav', 'search'));
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());

            } else {
                // header-default
                if (empty($body['topbar_text'])) set_theme_mod('topbar_show', 0);
                set_theme_mod('header_height', !empty($body['header_height']) ? (int)$body['header_height'] : 90);
                remove_theme_mod('header_bottom_height');
                set_theme_mod('header_elements_left', array('search', 'nav'));
                set_theme_mod('header_elements_right', array('account', 'divider', 'cart'));
                set_theme_mod('header_elements_bottom_left', array());
                set_theme_mod('header_elements_bottom_center', array());
                set_theme_mod('header_elements_bottom_right', array());
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

        // Process Header Main Width (Thanh trên: Logo & Buttons)
        $header_main_width = !empty($body['header_width']) ? sanitize_text_field($body['header_width']) : 'container';
        set_theme_mod('header_width', $header_main_width);

        $header_css = '';
        if ($header_main_width === 'full-width') {
            $header_css .= "\n/* Flatsome Header Main: Full-Width 100% */\n" .
                "#masthead .container, .header-main .container {\n" .
                "  max-width: 100% !important;\n" .
                "  width: 100% !important;\n" .
                "  padding-left: 25px !important;\n" .
                "  padding-right: 25px !important;\n" .
                "}\n";
        } else {
            $header_css .= "\n/* Flatsome Header Main: Standard Container (Có lề 1200px) */\n" .
                "#masthead .container, .header-main .container {\n" .
                "  max-width: var(--site-width, 1200px) !important;\n" .
                "  width: 100% !important;\n" .
                "  margin-left: auto !important;\n" .
                "  margin-right: auto !important;\n" .
                "}\n";
        }

        // Process Header Bottom Width (Thanh dưới: Menu Điều Hướng Chính)
        $header_bottom_width = !empty($body['header_bottom_width']) ? sanitize_text_field($body['header_bottom_width']) : 'full-width';
        if ($header_bottom_width === 'container') {
            $header_css .= "\n/* Flatsome Header Bottom: Standard Container (Có lề 1200px) */\n" .
                "#wide-nav .container, .header-bottom .container {\n" .
                "  max-width: var(--site-width, 1200px) !important;\n" .
                "  width: 100% !important;\n" .
                "  margin-left: auto !important;\n" .
                "  margin-right: auto !important;\n" .
                "}\n";
        } else {
            $header_css .= "\n/* Flatsome Header Bottom: Full-Width Tràn 100% */\n" .
                "#wide-nav .container, .header-bottom .container {\n" .
                "  max-width: 100% !important;\n" .
                "  width: 100% !important;\n" .
                "  padding-left: 25px !important;\n" .
                "  padding-right: 25px !important;\n" .
                "}\n";
        }

        // Luôn bảo đảm menu thanh dưới dàn ngang trên 1 dòng duy nhất, không bị gãy/rớt xuống dòng 2
        $header_css .= "\n/* Flatsome Prevent Nav Items Wrapping into 2 rows */\n" .
            "#wide-nav .nav, .header-bottom .nav, #wide-nav .header-bottom-nav, .header-nav {\n" .
            "  flex-wrap: nowrap !important;\n" .
            "  white-space: nowrap !important;\n" .
            "}\n" .
            "#wide-nav .flex-left, #wide-nav .flex-center, #wide-nav .flex-right {\n" .
            "  flex-shrink: 0 !important;\n" .
            "}\n" .
            "#wide-nav .nav > li > a, .header-bottom .nav > li > a {\n" .
            "  white-space: nowrap !important;\n" .
            "  padding-left: 12px !important;\n" .
            "  padding-right: 12px !important;\n" .
            "}\n";

        // Enhance Header CTA Buttons (Red pill buttons like Juega365, Casino, Sports)
        $header_css .= "\n/* Flatsome Header CTA Buttons (Vibrant Casino / Juega365 Red Buttons) */\n" .
            ".header-nav .header-button .button {\n" .
            "  font-weight: 700 !important;\n" .
            "  text-transform: uppercase !important;\n" .
            "  letter-spacing: 0.5px !important;\n" .
            "  margin-left: 8px !important;\n" .
            "  padding: 8px 18px !important;\n" .
            "  min-height: auto !important;\n" .
            "  font-size: 13px !important;\n" .
            "  border-radius: 99px !important;\n" .
            "  box-shadow: 0 2px 8px rgba(0,0,0,0.25) !important;\n" .
            "  display: inline-flex !important;\n" .
            "  align-items: center !important;\n" .
            "  justify-content: center !important;\n" .
            "}\n" .
            ".header-nav .header-button .button.alert {\n" .
            "  background-color: #e53935 !important;\n" .
            "  border-color: #e53935 !important;\n" .
            "  color: #ffffff !important;\n" .
            "}\n" .
            ".header-nav .header-button .button.alert:hover {\n" .
            "  background-color: #c62828 !important;\n" .
            "  border-color: #c62828 !important;\n" .
            "  transform: translateY(-1px);\n" .
            "}\n";

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
        if (isset($body['header_button_1_link_target'])) {
            set_theme_mod('header_button_1_link_target', sanitize_text_field($body['header_button_1_link_target']));
        }
        if (isset($body['header_button_1_link_rel'])) {
            $rel1 = sanitize_text_field($body['header_button_1_link_rel']);
            set_theme_mod('header_button_1_link_rel', $rel1);
            update_option('flatsome_seo_header_button_1_rel', $rel1);
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
        if (isset($body['header_button_2_link_target'])) {
            set_theme_mod('header_button_2_link_target', sanitize_text_field($body['header_button_2_link_target']));
        }
        if (isset($body['header_button_2_link_rel'])) {
            $rel2 = sanitize_text_field($body['header_button_2_link_rel']);
            set_theme_mod('header_button_2_link_rel', $rel2);
            update_option('flatsome_seo_header_button_2_rel', $rel2);
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

        // Final safety check: If bottom bar is active, NEVER allow 'nav' in header main left/right!
        if (get_theme_mod('header_bottom_height')) {
            $hel = array_diff($hel, array('nav'));
            $her = array_diff($her, array('nav'));
            $bl = (array)get_theme_mod('header_elements_bottom_left', array());
            if (!in_array('nav', $bl)) {
                $bl[] = 'nav';
                set_theme_mod('header_elements_bottom_left', array_values($bl));
            }
        }

        // If wide nav dark / wide nav, ensure button-1 and button-2 are present if enabled
        $curr_preset = !empty($body['header_preset']) ? sanitize_text_field($body['header_preset']) : get_theme_mod('header_preset');
        if ($curr_preset === 'header-wide-nav-dark' || $curr_preset === 'header-wide-nav') {
            if (!isset($body['header_button_1_show']) || !empty($body['header_button_1_show'])) {
                if (!in_array('button-1', $her)) $her[] = 'button-1';
            }
            if (!isset($body['header_button_2_show']) || !empty($body['header_button_2_show'])) {
                if (!in_array('button-2', $her)) $her[] = 'button-2';
            }
        }

        // Explicit Native Header Builder slots from frontend:
        if (isset($body['header_elements_left']) && is_array($body['header_elements_left'])) {
            $hel = array_values(array_filter(array_map('sanitize_text_field', $body['header_elements_left'])));
        }
        if (isset($body['header_elements_right']) && is_array($body['header_elements_right'])) {
            $her = array_values(array_filter(array_map('sanitize_text_field', $body['header_elements_right'])));
        }
        if (isset($body['header_elements_center']) && is_array($body['header_elements_center'])) {
            set_theme_mod('header_elements_center', array_values(array_filter(array_map('sanitize_text_field', $body['header_elements_center']))));
        }

        if (isset($body['topbar_elements_left']) && is_array($body['topbar_elements_left'])) {
            set_theme_mod('topbar_elements_left', array_values(array_filter(array_map('sanitize_text_field', $body['topbar_elements_left']))));
            if (!empty($body['topbar_elements_left']) || !empty($body['topbar_elements_center']) || !empty($body['topbar_elements_right'])) {
                set_theme_mod('topbar_show', 1);
            }
        }
        if (isset($body['topbar_elements_center']) && is_array($body['topbar_elements_center'])) {
            set_theme_mod('topbar_elements_center', array_values(array_filter(array_map('sanitize_text_field', $body['topbar_elements_center']))));
        }
        if (isset($body['topbar_elements_right']) && is_array($body['topbar_elements_right'])) {
            set_theme_mod('topbar_elements_right', array_values(array_filter(array_map('sanitize_text_field', $body['topbar_elements_right']))));
        }

        if (isset($body['header_elements_bottom_left']) && is_array($body['header_elements_bottom_left'])) {
            $hebl = array_values(array_filter(array_map('sanitize_text_field', $body['header_elements_bottom_left'])));
            if (!empty($hebl)) {
                set_theme_mod('header_elements_bottom_left', $hebl);
            }
        }
        if (isset($body['header_elements_bottom_center']) && is_array($body['header_elements_bottom_center'])) {
            set_theme_mod('header_elements_bottom_center', array_values(array_filter(array_map('sanitize_text_field', $body['header_elements_bottom_center']))));
        }
        if (isset($body['header_elements_bottom_right']) && is_array($body['header_elements_bottom_right'])) {
            set_theme_mod('header_elements_bottom_right', array_values(array_filter(array_map('sanitize_text_field', $body['header_elements_bottom_right']))));
        }

        // Element contents: HTML, Blocks, Contact
        if (isset($body['topbar_left'])) set_theme_mod('topbar_left', wp_kses_post($body['topbar_left']));
        if (isset($body['topbar_right'])) set_theme_mod('topbar_right', wp_kses_post($body['topbar_right']));
        if (isset($body['top_right_text'])) set_theme_mod('top_right_text', wp_kses_post($body['top_right_text']));
        if (isset($body['nav_position_text_top'])) set_theme_mod('nav_position_text_top', wp_kses_post($body['nav_position_text_top']));
        if (isset($body['nav_position_text'])) set_theme_mod('nav_position_text', wp_kses_post($body['nav_position_text']));

        if (isset($body['header_block_1'])) set_theme_mod('header-block-1', sanitize_text_field($body['header_block_1']));
        if (isset($body['header_block_2'])) set_theme_mod('header-block-2', sanitize_text_field($body['header_block_2']));
        if (isset($body['header_block_3'])) set_theme_mod('header-block-3', sanitize_text_field($body['header_block_3']));
        if (isset($body['header_block_4'])) set_theme_mod('header-block-4', sanitize_text_field($body['header_block_4']));

        if (isset($body['contact_phone'])) set_theme_mod('contact_phone', sanitize_text_field($body['contact_phone']));
        if (isset($body['contact_email'])) set_theme_mod('contact_email', sanitize_email($body['contact_email']));
        if (isset($body['contact_location'])) set_theme_mod('contact_location', sanitize_text_field($body['contact_location']));
        if (isset($body['contact_hours'])) set_theme_mod('contact_hours', sanitize_text_field($body['contact_hours']));

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
        $custom_css = !empty($body['custom_css']) ? $body['custom_css'] : '';
        $shortcode = preg_replace('/<!--\s*FLATSOME_BUILDER_STATE:.*?-->\s*/is', '', $shortcode);

        // 1. Trích xuất CSS nếu có thẻ <style> nào còn sót lại
        $extracted_css = '';
        if (preg_match_all('/<style[^>]*>(.*?)<\/style>/is', $shortcode, $matches)) {
            if (!empty($matches[1])) {
                $extracted_css = implode("\n\n", $matches[1]);
            }
        }

        // 2. LOẠI BỎ TRIỆT ĐỂ toàn bộ thẻ <style>, thẻ div thừa và các thẻ text rỗng khỏi shortcode
        // Giúp cây UX Builder sạch 100%, không bị sinh các thẻ 'Text' thừa và tối ưu chuẩn SEO
        $shortcode = preg_replace('/\[(ux_text|text)[^\]]*\]\s*<style[^>]*>[\s\S]*?<\/style>\s*\[\/(ux_text|text)\]\s*/is', '', $shortcode);
        $shortcode = preg_replace('/<style[^>]*>[\s\S]*?<\/style>\s*/is', '', $shortcode);
        $shortcode = preg_replace('/\[(ux_text|text)[^\]]*\]\s*<div[^>]*>\s*\[\/(ux_text|text)\]\s*/is', '', $shortcode);
        $shortcode = preg_replace('/\[(ux_text|text)[^\]]*\]\s*<\/div>\s*\[\/(ux_text|text)\]\s*/is', '', $shortcode);
        $shortcode = preg_replace('/\[(ux_text|text)[^\]]*\]\s*<p>\s*<\/p>\s*\[\/(ux_text|text)\]\s*/is', '', $shortcode);
        $shortcode = preg_replace('/\[(ux_text|text)[^\]]*\]\s*\[\/(ux_text|text)\]\s*/is', '', $shortcode);
        $shortcode = trim($shortcode);

        $final_page_css = trim($custom_css . "\n\n" . $extracted_css);

        // Bỏ các bộ lọc KSES trước khi lưu post để đảm bảo WordPress không nuốt mất shortcode
        if (function_exists('kses_remove_filters')) {
            kses_remove_filters();
        }

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

        if (function_exists('kses_init_filters')) {
            kses_init_filters();
        }

        if (is_wp_error($page_id)) {
            return $page_id;
        }

        // Set Flatsome full width template
        update_post_meta($page_id, '_wp_page_template', 'page-blank.php');

        // Lưu CSS tùy biến trực tiếp vào Core Theme Flatsome (_custom_css)
        // Flatsome Core Theme tự động xuất trong thẻ <head> của website chuẩn SEO!
        if (!empty($final_page_css)) {
            update_post_meta($page_id, '_custom_css', $final_page_css);
            update_post_meta($page_id, '_flatsome_seo_custom_css', $final_page_css);
        } else {
            delete_post_meta($page_id, '_custom_css');
            delete_post_meta($page_id, '_flatsome_seo_custom_css');
        }

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
     * API: Đặt hoặc gỡ Favicon (Biểu tượng trang web / Site Icon)
     */
    public function api_set_favicon($request) {
        $body = $request->get_json_params() ?: array();

        // 1. Gỡ bỏ Favicon
        if (!empty($body['remove'])) {
            update_option('site_icon', 0);
            remove_theme_mod('site_icon');
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Đã gỡ Favicon thành công! Website đã trở về biểu tượng mặc định.',
                'site_icon' => 0,
                'site_icon_url' => '',
            ));
        }

        $media_id = 0;
        $icon_url = '';

        // 2. Nếu đã có media_id từ Media Library
        if (!empty($body['media_id'])) {
            $media_id = (int)$body['media_id'];
            $icon_url = wp_get_attachment_image_url($media_id, 'full');
        } elseif (!empty($_FILES['file']) || !empty($body['file_data']) || !empty($body['fileData']) || !empty($body['image_url']) || !empty($body['imageUrl'])) {
            // 3. Tải ảnh mới lên Media Library
            $req_params = array(
                'filename' => !empty($body['filename']) ? sanitize_file_name($body['filename']) : 'favicon-' . time() . '.png',
                'file_data' => !empty($body['file_data']) ? $body['file_data'] : (!empty($body['fileData']) ? $body['fileData'] : ''),
                'image_url' => !empty($body['image_url']) ? $body['image_url'] : (!empty($body['imageUrl']) ? $body['imageUrl'] : ''),
                'title' => 'Site Favicon - ' . get_bloginfo('name'),
                'alt_text' => 'Favicon ' . get_bloginfo('name'),
                'caption' => 'Favicon',
                'description' => 'Biểu tượng trang web (Site Icon / Favicon)'
            );
            $upload_req = new WP_REST_Request('POST', '/' . self::API_NAMESPACE . '/upload-media');
            $upload_req->set_body_params($req_params);
            $res = $this->api_upload_media($upload_req);
            if (is_wp_error($res)) {
                return $res;
            }
            $data = is_object($res) && method_exists($res, 'get_data') ? $res->get_data() : $res;
            if (!empty($data['media']['id'])) {
                $media_id = (int)$data['media']['id'];
                $icon_url = $data['media']['url'];
            }
        }

        if ($media_id > 0) {
            update_option('site_icon', $media_id);
            set_theme_mod('site_icon', $media_id);
            if (empty($icon_url)) {
                $icon_url = wp_get_attachment_image_url($media_id, 'full') ?: get_site_icon_url();
            }

            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Đã cập nhật Favicon (Site Icon) thành công! Biểu tượng mới đã được kích hoạt trên toàn bộ website.',
                'site_icon' => $media_id,
                'site_icon_url' => $icon_url,
            ));
        }

        return new WP_Error('missing_favicon', 'Vui lòng cung cấp file favicon hoặc chọn ảnh từ thư viện', array('status' => 400));
    }

    /**
     * Render thẻ link favicon vào thẻ <head> của Frontend, Admin & Login (Ghi đè icon chữ W mặc định)
     * Thêm tham số ?v= để phá bộ nhớ đệm (bypassing aggressive browser favicon cache)
     */
    public function render_site_favicon() {
        $site_icon_id = get_option('site_icon');
        if (!empty($site_icon_id)) {
            $icon_url = is_numeric($site_icon_id) ? wp_get_attachment_image_url($site_icon_id, 'full') : $site_icon_id;
            if (!empty($icon_url)) {
                $v = is_numeric($site_icon_id) ? $site_icon_id : time();
                $busted_url = esc_url($icon_url . (strpos($icon_url, '?') !== false ? '&' : '?') . 'v=' . $v);
                echo "\n<!-- Flatsome SEO AutoBridge Favicon (Force Cache Bust) -->\n";
                echo '<link rel="shortcut icon" href="' . $busted_url . '" />' . "\n";
                echo '<link rel="icon" type="image/png" href="' . $busted_url . '" sizes="32x32" />' . "\n";
                echo '<link rel="icon" type="image/png" href="' . $busted_url . '" sizes="192x192" />' . "\n";
                echo '<link rel="apple-touch-icon" href="' . $busted_url . '" />' . "\n";
                echo '<meta name="msapplication-TileImage" content="' . $busted_url . '" />' . "\n";
            }
        }
    }

    /**
     * API 9: Lấy danh sách ảnh từ Media Library (Mặc định lấy toàn bộ ảnh không giới hạn)
     */
    public function api_list_media($request) {
        $limit_param = $request->get_param('limit') ?: $request->get_param('posts_per_page') ?: $request->get_param('per_page');
        $limit = -1; // Mặc định -1 để lấy đầy đủ tất cả ảnh trong thư viện
        if ($limit_param !== null && $limit_param !== '') {
            $parsed_limit = intval($limit_param);
            if ($parsed_limit !== 0) {
                $limit = $parsed_limit;
            }
        }

        $paged = intval($request->get_param('page') ?: $request->get_param('paged') ?: 1);
        $search = sanitize_text_field($request->get_param('search') ?: $request->get_param('s') ?: '');

        $args = array(
            'post_type' => 'attachment',
            'post_mime_type' => 'image',
            'post_status' => 'inherit',
            'posts_per_page' => $limit,
            'paged' => $paged,
            'orderby' => 'date',
            'order' => 'DESC'
        );

        if (!empty($search)) {
            $args['s'] = $search;
        }

        $query = new WP_Query($args);

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
            'media' => $media,
            'total' => $query->found_posts ?: count($media)
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
        $seen_post_ids = array();
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
                'numberposts' => -1,
                'posts_per_page' => -1,
                'nopaging' => true,
                'suppress_filters' => true,
                'orderby' => 'date',
                'order' => 'DESC'
            ));

            // Quét trực tiếp MySQL DB để đảm bảo không bị bất kỳ plugin nào giới hạn số lượng trang
            global $wpdb;
            $db_pages = $wpdb->get_results("
                SELECT ID, post_title, post_name, post_excerpt, post_type, post_status 
                FROM {$wpdb->posts} 
                WHERE post_type = 'page' 
                  AND post_status IN ('publish', 'draft', 'pending', 'future', 'private')
                ORDER BY post_date DESC
            ");

            $all_pages = (!empty($db_pages) && count($db_pages) > count($pages)) ? $db_pages : $pages;

            foreach ($all_pages as $p) {
                $pid = (int)$p->ID;
                if (isset($seen_post_ids[$pid])) continue;
                $seen_post_ids[$pid] = true;
                $is_front = ($front_page_id && $pid === $front_page_id);
                $items[] = array(
                    'id' => $pid,
                    'title' => $p->post_title ?: ('Trang #' . $pid),
                    'slug' => $is_front ? '/' : ('/' . $p->post_name),
                    'description' => $p->post_excerpt ?: '',
                    'type' => 'page',
                    'url' => get_permalink($pid),
                    'is_existing' => true,
                    'is_front_page' => $is_front
                );
            }
        }

        // 3. Lấy Posts (Bài viết) - Quét sạch 100% toàn bộ bài viết không bị giới hạn 10 bài
        if ($filter_type === 'all' || $filter_type === 'post') {
            $posts = get_posts(array(
                'post_type' => 'post',
                'post_status' => array('publish', 'draft', 'pending', 'future', 'private'),
                'numberposts' => -1,
                'posts_per_page' => -1,
                'nopaging' => true,
                'suppress_filters' => true,
                'orderby' => 'date',
                'order' => 'DESC'
            ));

            // Quét trực tiếp MySQL DB để bảo đảm quét sạch toàn bộ bài viết không bị kẹp 10 bài bởi theme/plugin khác
            global $wpdb;
            $db_posts = $wpdb->get_results("
                SELECT ID, post_title, post_name, post_excerpt, post_type, post_status 
                FROM {$wpdb->posts} 
                WHERE post_type = 'post' 
                  AND post_status IN ('publish', 'draft', 'pending', 'future', 'private')
                ORDER BY post_date DESC
            ");

            $all_posts = (!empty($db_posts) && count($db_posts) > count($posts)) ? $db_posts : $posts;

            foreach ($all_posts as $p) {
                $pid = (int)$p->ID;
                if (isset($seen_post_ids[$pid])) continue;
                $seen_post_ids[$pid] = true;
                $items[] = array(
                    'id' => $pid,
                    'title' => $p->post_title ?: ('Bài viết #' . $pid),
                    'slug' => '/' . $p->post_name,
                    'description' => $p->post_excerpt ?: '',
                    'type' => 'post',
                    'url' => get_permalink($pid),
                    'is_existing' => true
                );
            }
        }

        // 4. Lấy Custom Post Types công khai khác (ví dụ: tickets, products, portfolio, games...)
        $cpt_types = get_post_types(array('public' => true, '_builtin' => false), 'objects');
        if (!empty($cpt_types)) {
            global $wpdb;
            foreach ($cpt_types as $cpt_name => $cpt_obj) {
                if (in_array($cpt_name, array('blocks', 'ux_block', 'elementor_library'))) continue;
                if ($filter_type === 'all' || $filter_type === $cpt_name || $filter_type === 'post') {
                    $cpt_posts = get_posts(array(
                        'post_type' => $cpt_name,
                        'post_status' => array('publish', 'draft', 'future', 'private'),
                        'numberposts' => -1,
                        'posts_per_page' => -1,
                        'nopaging' => true,
                        'suppress_filters' => true,
                        'orderby' => 'date',
                        'order' => 'DESC'
                    ));

                    $db_cpt = $wpdb->get_results($wpdb->prepare("
                        SELECT ID, post_title, post_name, post_excerpt, post_type, post_status 
                        FROM {$wpdb->posts} 
                        WHERE post_type = %s 
                          AND post_status IN ('publish', 'draft', 'pending', 'future', 'private')
                        ORDER BY post_date DESC
                    ", $cpt_name));

                    $all_cpt = (!empty($db_cpt) && count($db_cpt) > count($cpt_posts)) ? $db_cpt : $cpt_posts;

                    foreach ($all_cpt as $p) {
                        $pid = (int)$p->ID;
                        if (isset($seen_post_ids[$pid])) continue;
                        $seen_post_ids[$pid] = true;
                        $items[] = array(
                            'id' => $pid,
                            'title' => $p->post_title ?: ($cpt_name . ' #' . $pid),
                            'slug' => '/' . $p->post_name,
                            'description' => $p->post_excerpt ?: '',
                            'type' => 'post',
                            'cpt_type' => $cpt_name,
                            'cpt_label' => !empty($cpt_obj->labels->singular_name) ? $cpt_obj->labels->singular_name : $cpt_name,
                            'url' => get_permalink($pid),
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
            $item_url = !empty($item['url']) ? trim($item['url']) : '';
            if (empty($item_url) && !empty($item['slug'])) {
                $item_url = home_url($item['slug']);
            }
            if ($item_url === '/') {
                $item_url = home_url('/');
            } elseif (strpos($item_url, '/') === 0 && strpos($item_url, '//') !== 0) {
                $item_url = home_url($item_url);
            }
            if (empty($item_url)) {
                $item_url = home_url('/');
            }

            $item_type = !empty($item['type']) ? sanitize_text_field($item['type']) : 'custom';
            $item_object = !empty($item['object']) ? sanitize_text_field($item['object']) : 'custom';
            $item_object_id = !empty($item['object_id']) ? (int)$item['object_id'] : 0;
            $item_target = !empty($item['target']) ? sanitize_text_field($item['target']) : '';

            $parent_c_id = !empty($item['parent_client_id']) ? $item['parent_client_id'] : null;
            $parent_db_id = ($parent_c_id && isset($id_map[$parent_c_id])) ? (int)$id_map[$parent_c_id] : 0;

            $menu_item_data = array(
                'menu-item-title' => $item_title,
                'menu-item-url' => $item_url,
                'menu-item-type' => $item_type,
                'menu-item-object' => $item_object,
                'menu-item-object-id' => $item_object_id,
                'menu-item-status' => 'publish',
                'menu-item-position' => $order_counter,
                'menu-item-target' => $item_target,
                'menu-item-parent-id' => $parent_db_id,
            );

            $new_db_id = wp_update_nav_menu_item($active_menu_id, 0, $menu_item_data);
            if (!is_wp_error($new_db_id)) {
                $id_map[$c_id] = (int)$new_db_id;
                if ($parent_db_id > 0) {
                    update_post_meta((int)$new_db_id, '_menu_item_menu_item_parent', (int)$parent_db_id);
                }
            }
            $order_counter++;
        }

        // Pass 2: Đảm bảo toàn bộ quan hệ Cha - Con (Submenu) được gán chuẩn xác mà KHÔNG làm mất Title / URL
        foreach ($items as $item) {
            $c_id = !empty($item['client_id']) ? $item['client_id'] : null;
            $parent_c_id = !empty($item['parent_client_id']) ? $item['parent_client_id'] : null;

            if ($c_id && isset($id_map[$c_id]) && $parent_c_id && isset($id_map[$parent_c_id])) {
                $child_db_id = $id_map[$c_id];
                $parent_db_id = $id_map[$parent_c_id];
                update_post_meta($child_db_id, '_menu_item_menu_item_parent', (int)$parent_db_id);
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

        // Luôn bảo đảm menu thanh dưới (Wide Nav) không bị gãy 2 dòng
        if (strpos($header_css, '#wide-nav .nav') === false) {
            $header_css .= "\n/* Flatsome Header Bottom Nav Nowrap */\n#wide-nav .nav, .header-bottom .nav, #wide-nav .header-bottom-nav, .header-nav { flex-wrap: nowrap !important; white-space: nowrap !important; }\n#wide-nav .flex-left, #wide-nav .flex-center, #wide-nav .flex-right { flex-shrink: 0 !important; }\n#wide-nav .nav > li > a, .header-bottom .nav > li > a { white-space: nowrap !important; padding-left: 12px !important; padding-right: 12px !important; }\n";
        }

        // Tự động xử lý độ rộng Header Main (Container vs Full-Width)
        $is_full_width_header = (get_theme_mod('header_width') === 'full-width');
        if ($is_full_width_header) {
            $header_css .= "\n/* Flatsome Header Main: Full-Width 100% */\n#header .container, #masthead .container, .header-main .container, .header-full-width .container { max-width: 100% !important; width: 100% !important; padding-left: 25px !important; padding-right: 25px !important; }\n";
        } else {
            $header_css .= "\n/* Flatsome Header Main: Standard Container 1200px */\n#masthead .container, .header-main .container { max-width: var(--site-width, 1200px) !important; width: 100% !important; margin-left: auto !important; margin-right: auto !important; }\n";
        }
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

        $btn_animations_css = "
/* ==========================================================
 * FLATSOME AUTOTHEME - HIỆU ỨNG NÚT BẤM (BUTTON ANIMATIONS)
 * ========================================================== */

/* 1. Hiệu Ứng Nút Bấm: Quét Sáng (Shimmer Sweep) */
.button.btn-anim-shimmer, a.button.btn-anim-shimmer, .btn-anim-shimmer {
  position: relative !important;
  overflow: hidden !important;
  z-index: 1 !important;
}
.button.btn-anim-shimmer::after, a.button.btn-anim-shimmer::after, .btn-anim-shimmer::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -120% !important;
  width: 70% !important;
  height: 100% !important;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%) !important;
  transform: skewX(-25deg) !important;
  animation: jglBtnShimmerSweep 2.2s infinite ease-in-out !important;
  pointer-events: none !important;
  z-index: 2 !important;
}
@keyframes jglBtnShimmerSweep {
  0% { left: -120%; }
  35%, 100% { left: 220%; }
}

/* 2. Hiệu Ứng Nút Bấm: Rung Lắc Chú Ý (Shake / Wiggle) */
.button.btn-anim-shake, a.button.btn-anim-shake, .btn-anim-shake {
  display: inline-block !important;
  animation: jglBtnShakeNotice 2.2s infinite ease-in-out !important;
  transform-origin: center center !important;
}
@keyframes jglBtnShakeNotice {
  0%, 65%, 100% { transform: scale(1) rotate(0deg); }
  68% { transform: scale(1.08) rotate(-6deg); }
  72% { transform: scale(1.08) rotate(6deg); }
  76% { transform: scale(1.08) rotate(-5deg); }
  80% { transform: scale(1.08) rotate(4deg); }
  84% { transform: scale(1.04) rotate(-2deg); }
  88% { transform: scale(1) rotate(0deg); }
}

/* 3. Hiệu Ứng Nút Bấm: Lan Tỏa Màu (Ripple Waves / Sóng Màu Lan Tỏa) */
.button.btn-anim-ripple, a.button.btn-anim-ripple, .btn-anim-ripple {
  position: relative !important;
  overflow: visible !important;
  z-index: 1 !important;
  animation: jglBtnRipplePulse 2s infinite ease-in-out !important;
}
.button.btn-anim-ripple::before, a.button.btn-anim-ripple::before, .btn-anim-ripple::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 2px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
.button.btn-anim-ripple::after, a.button.btn-anim-ripple::after, .btn-anim-ripple::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 1.5px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) 0.9s !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
@keyframes jglBtnRippleRing {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.38, 1.48); opacity: 0; }
}
@keyframes jglBtnRipplePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 16px 2px rgba(255, 255, 255, 0.8), 0 0 20px 4px currentColor; }
}

/* 4. Hiệu Ứng Nút Bấm: Hào Quang Neon (Pulse Glow) */
.button.btn-anim-glow, a.button.btn-anim-glow, .btn-anim-glow {
  animation: jglBtnGlowPulse 1.8s infinite ease-in-out !important;
}
@keyframes jglBtnGlowPulse {
  0%, 100% {
    box-shadow: 0 0 6px rgba(255, 120, 0, 0.4), 0 0 12px currentColor;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 24px rgba(255, 120, 0, 0.9), 0 0 38px currentColor, 0 0 50px rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
  }
}

/* 5. Hiệu Ứng Nút Bấm: Nhịp Thở Phóng To (Heartbeat Pulse) */
.button.btn-anim-pulse, a.button.btn-anim-pulse, .btn-anim-pulse {
  display: inline-block !important;
  animation: jglBtnHeartPulse 1.6s infinite ease-in-out !important;
  transform-origin: center center !important;
}
@keyframes jglBtnHeartPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
}

/* 6. Hiệu Ứng Nút Bấm: Combo VIP (Rung Lắc + Lan Tỏa Màu) */
.button.btn-anim-combo, a.button.btn-anim-combo, .btn-anim-combo {
  display: inline-block !important;
  position: relative !important;
  overflow: visible !important;
  z-index: 1 !important;
  animation: jglBtnShakeNotice 2.2s infinite ease-in-out !important;
  transform-origin: center center !important;
}
.button.btn-anim-combo::before, a.button.btn-anim-combo::before, .btn-anim-combo::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 2px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
.button.btn-anim-combo::after, a.button.btn-anim-combo::after, .btn-anim-combo::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 1.5px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) 0.9s !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
";

        $page_id = get_queried_object_id();
        $page_seo_css = '';
        if ($page_id) {
            $page_seo_css = get_post_meta($page_id, '_flatsome_seo_custom_css', true);
        }

        $site_bg_css = get_option('flatsome_seo_site_bg_css', '');
        if (!empty($site_bg_css)) {
            // Bảo đảm các section và #wrapper luôn trong suốt để hiển thị màu / ảnh nền
            if (strpos($site_bg_css, '#main section.section') === false) {
                $site_bg_css .= "\n#wrapper { background-color: transparent !important; background: transparent !important; }\n#main section.section, #main .section-bg, #content section.section, #content .section-bg {\n  background-color: transparent !important;\n}\n";
            }
        }

        $subpage_css = get_option('flatsome_seo_subpage_css', '');

        echo "\n<!-- Flatsome AutoTheme Custom Menu, Header, Subpage & Full-Width Styling -->\n<style id=\"flatsome-autotheme-menu-css\">\n" . wp_strip_all_tags($css . "\n" . $header_css . "\n" . $layout_fix_css . "\n" . $topbar_hide_css . "\n" . $btn_animations_css . "\n" . $site_bg_css . "\n" . $subpage_css . ($page_seo_css ? "\n" . $page_seo_css : "")) . "\n</style>\n";
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
  #wide-nav .nav-dropdown,
  ul.nav-dropdown {
    background-color: {$dropdown_bg} !important;
    border-radius: 10px !important;
    box-shadow: 0 12px 30px rgba(0,0,0,0.25) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    padding: 8px 6px !important;
    min-width: 220px !important;
  }

  /* Dropdown Submenu Links */
  .nav-dropdown > li > a,
  .nav-dropdown li > a,
  .header-nav .nav-dropdown > li > a,
  .header-nav .nav-dropdown li > a {
    color: {$dropdown_text} !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    border-radius: 6px !important;
    padding: 9px 14px !important;
    display: block !important;
    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    white-space: normal !important;
    margin: 0 !important;
    transition: all 0.15s ease !important;
  }

  .nav-dropdown > li:last-child > a,
  .nav-dropdown li:last-child > a {
    border-bottom: none !important;
  }

  .nav-dropdown > li > a:hover,
  .nav-dropdown li > a:hover,
  .header-nav .nav-dropdown > li > a:hover,
  .header-nav .nav-dropdown li > a:hover {
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

    /**
     * API Lưu Cấu Hình Trang Con & Bài Viết (Subpage & Content Styling)
     */
    public function api_save_subpage_styling($request) {
        $body = $request->get_json_params();
        if (empty($body)) {
            $body = $request->get_params();
        }

        $styling = !empty($body['styling']) ? $body['styling'] : $body;
        if (!is_array($styling)) {
            return new WP_REST_Response(array('success' => false, 'error' => 'Dữ liệu styling không hợp lệ'), 400);
        }

        // Đảm bảo các giá trị mặc định cho bài viết & sidebar luôn đầy đủ
        if (empty($styling['postLayout'])) {
            $styling['postLayout'] = 'right-sidebar';
        }
        if (!isset($styling['sidebarSuggestedPostsEnabled'])) {
            $styling['sidebarSuggestedPostsEnabled'] = true;
        }
        if (!isset($styling['sidebarCtaEnabled'])) {
            $styling['sidebarCtaEnabled'] = true;
        }
        if (!isset($styling['relatedPostsEnabled'])) {
            $styling['relatedPostsEnabled'] = true;
        }
        if (!isset($styling['sidebarSticky'])) {
            $styling['sidebarSticky'] = true;
        }
        if (!isset($styling['sidebarCleanOnly'])) {
            $styling['sidebarCleanOnly'] = true;
        }

        update_option('flatsome_seo_subpage_styling', $styling);

        // Social Share & Post Footer Options
        $share_enabled = !isset($styling['postShareEnabled']) || !empty($styling['postShareEnabled']);
        $share_networks = !empty($styling['postShareNetworks']) && is_array($styling['postShareNetworks'])
            ? $styling['postShareNetworks']
            : array('facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'pinterest', 'linkedin');
        $share_style = !empty($styling['postShareStyle']) ? sanitize_text_field($styling['postShareStyle']) : 'outline';
        $author_box = !empty($styling['postAuthorBoxEnabled']) ? 1 : 0;
        $nav_enabled = !isset($styling['postNavEnabled']) || !empty($styling['postNavEnabled']) ? 1 : 0;

        $footer_meta = !empty($styling['postFooterMetaEnabled']) ? 1 : 0;

        set_theme_mod('blog_post_layout', sanitize_text_field($styling['postLayout']));
        set_theme_mod('blog_sticky_sidebar', !empty($styling['sidebarSticky']));
        set_theme_mod('blog_share', $share_enabled ? 1 : 0);
        set_theme_mod('social_icons', $share_networks);
        set_theme_mod('social_icons_style', $share_style);
        set_theme_mod('blog_author_box', $author_box);
        set_theme_mod('blog_single_next_prev_nav', $nav_enabled);
        set_theme_mod('blog_single_footer_meta', $footer_meta);

        // Đồng bộ cả option flatsome_options để theme Flatsome ưu tiên đọc chuẩn 100%
        $flatsome_opts = get_option('flatsome_options', array());
        if (is_array($flatsome_opts)) {
            $flatsome_opts['blog_post_layout'] = sanitize_text_field($styling['postLayout']);
            $flatsome_opts['blog_sticky_sidebar'] = !empty($styling['sidebarSticky']) ? 1 : 0;
            $flatsome_opts['blog_share'] = $share_enabled ? 1 : 0;
            $flatsome_opts['social_icons'] = $share_networks;
            $flatsome_opts['social_icons_style'] = $share_style;
            $flatsome_opts['blog_author_box'] = $author_box;
            $flatsome_opts['blog_single_next_prev_nav'] = $nav_enabled;
            $flatsome_opts['blog_single_footer_meta'] = $footer_meta;
            update_option('flatsome_options', $flatsome_opts);
        }

        if (function_exists('opcache_reset')) {
            @opcache_reset();
        }

        $compiled_css = $this->compile_subpage_css($styling);
        update_option('flatsome_seo_subpage_css', $compiled_css);

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Đã lưu và cập nhật style trang con & bài viết thành công!',
            'styling' => $styling,
            'compiled_css' => $compiled_css
        ), 200);
    }

    /**
     * Biên dịch bộ cấu hình Trang Con & Bài Viết thành mã CSS chuẩn Flatsome
     */
    public function compile_subpage_css($styling) {
        if (empty($styling) || !is_array($styling)) {
            return '';
        }

        $text_color = !empty($styling['textColor']) ? $styling['textColor'] : '#cbd5e1';
        $h1_color = !empty($styling['heading1Color']) ? $styling['heading1Color'] : '#ffffff';
        $h2_color = !empty($styling['heading2Color']) ? $styling['heading2Color'] : '#38bdf8';
        $h3_color = !empty($styling['heading3Color']) ? $styling['heading3Color'] : '#fde047';
        $link_color = !empty($styling['linkColor']) ? $styling['linkColor'] : '#38bdf8';
        $link_hover = !empty($styling['linkHoverColor']) ? $styling['linkHoverColor'] : '#fde047';
        $font_size = !empty($styling['contentFontSize']) ? $styling['contentFontSize'] : '16px';
        $line_height = !empty($styling['contentLineHeight']) ? $styling['contentLineHeight'] : '1.75';
        $max_width = !empty($styling['contentMaxWidth']) ? $styling['contentMaxWidth'] : '1080px';
        $page_bg = !empty($styling['pageBgColor']) ? $styling['pageBgColor'] : 'transparent';

        // TOC
        $toc_enabled = !empty($styling['tocEnabled']);
        $toc_bg = !empty($styling['tocBgColor']) ? $styling['tocBgColor'] : '#090d16';
        $toc_border = !empty($styling['tocBorderColor']) ? $styling['tocBorderColor'] : '#1e293b';
        $toc_title = !empty($styling['tocTitleColor']) ? $styling['tocTitleColor'] : '#ffffff';
        $toc_link = !empty($styling['tocLinkColor']) ? $styling['tocLinkColor'] : '#94a3b8';
        $toc_radius = !empty($styling['tocRadius']) ? $styling['tocRadius'] : '10px';

        // Badges
        $badge_border = !empty($styling['badgeBorderColor']) ? $styling['badgeBorderColor'] : '#eab308';
        $badge_bg = !empty($styling['badgeBgColor']) ? $styling['badgeBgColor'] : 'rgba(15, 23, 42, 0.8)';
        $badge_text = !empty($styling['badgeTextColor']) ? $styling['badgeTextColor'] : '#ffffff';
        $badge_radius = !empty($styling['badgeRadius']) ? $styling['badgeRadius'] : '99px';

        // Callout
        $callout_gold = !empty($styling['calloutGoldBorder']) ? $styling['calloutGoldBorder'] : '#f59e0b';
        $callout_blue = !empty($styling['calloutBlueBorder']) ? $styling['calloutBlueBorder'] : '#38bdf8';
        $callout_green = !empty($styling['calloutGreenBorder']) ? $styling['calloutGreenBorder'] : '#10b981';
        $callout_bg = !empty($styling['calloutBgColor']) ? $styling['calloutBgColor'] : 'rgba(15, 23, 42, 0.85)';
        $callout_radius = !empty($styling['calloutRadius']) ? $styling['calloutRadius'] : '12px';

        // Tables
        $th_bg = !empty($styling['tableHeaderBg']) ? $styling['tableHeaderBg'] : '#1e293b';
        $th_color = !empty($styling['tableHeaderColor']) ? $styling['tableHeaderColor'] : '#f8fafc';
        $tb_border = !empty($styling['tableBorderColor']) ? $styling['tableBorderColor'] : '#334155';
        $tb_radius = !empty($styling['tableRadius']) ? $styling['tableRadius'] : '8px';

        $custom_css = !empty($styling['customCss']) ? $styling['customCss'] : '';

        $css = "
/* Đảm bảo tuyệt đối Header, Topbar, Main Menu, Dropdown KHÔNG BAO GIỜ bị gạch dưới */
#header a,
#header .nav > li > a,
#header .nav-dropdown a,
.header-wrapper a,
#wide-nav a,
.header-bottom a,
.header-main a,
.header-nav a,
.top-bar a,
.nav a,
.nav > li > a,
.nav-dropdown a,
.mobile-sidebar a,
.breadcrumbs a,
.button,
a.button,
#secondary a,
.autoweb-related-posts-section a,
.autoweb-sidebar-widget a {
  text-decoration: none !important;
}

/* Flatsome AutoTheme: Ẩn link category nhỏ lặp lại (entry-category) trên từng bài viết ở trang Category & Archive */
.archive .entry-category,
.category .entry-category,
.blog-archive .entry-category,
.blog .entry-category,
.archive .entry-header-text .entry-category,
.category .entry-header-text .entry-category,
.archive .article-inner .entry-category,
.category .article-inner .entry-category {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Flatsome AutoTheme: Rank Math Breadcrumbs Styling */
.autoweb-breadcrumbs-wrapper {
  padding-top: 14px;
  padding-bottom: 8px;
  width: 100%;
}
.autoweb-breadcrumbs-container {
  display: flex;
  align-items: center;
}
.rank-math-breadcrumb,
.autoweb-breadcrumbs-container .rank-math-breadcrumb,
.breadcrumbs.rank-math-breadcrumb {
  font-size: 13px !important;
  line-height: 1.5 !important;
  color: #94a3b8 !important;
  letter-spacing: normal !important;
  text-transform: none !important;
}
.rank-math-breadcrumb p {
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 6px !important;
}
.rank-math-breadcrumb a {
  color: {$link_color} !important;
  text-decoration: none !important;
  font-weight: 500 !important;
  transition: color 0.15s ease !important;
}
.rank-math-breadcrumb a:hover {
  color: {$link_hover} !important;
  text-decoration: underline !important;
}
.rank-math-breadcrumb .separator {
  color: #64748b !important;
  font-size: 11px !important;
  margin: 0 2px !important;
  user-select: none !important;
  opacity: 0.8 !important;
}
.rank-math-breadcrumb .last {
  color: {$text_color} !important;
  font-weight: 600 !important;
  max-width: 480px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 768px) {
  .autoweb-breadcrumbs-wrapper {
    padding-top: 10px;
    padding-bottom: 6px;
  }
  .rank-math-breadcrumb {
    font-size: 12px !important;
  }
  .rank-math-breadcrumb .last {
    max-width: 220px;
  }
}

/* Flatsome AutoTheme: Subpage & Content Typography - Scoped strictly to #main #content */
#main #content,
#main .content-area,
#main .page-wrapper,
#main .col-inner,
#main article,
#main .entry-content,
#main .post-content {
  color: {$text_color} !important;
  font-size: {$font_size} !important;
  line-height: {$line_height} !important;
}

#main #content p,
#main #content li,
#main .col-inner p,
#main .col-inner li,
#main .entry-content p,
#main .entry-content li {
  color: {$text_color} !important;
  font-size: {$font_size} !important;
  line-height: {$line_height} !important;
}

#main #content strong,
#main .col-inner strong,
#main .entry-content strong {
  color: #ffffff !important;
  font-weight: 700 !important;
}

/* Headings H1, H2, H3, H4 inside #main */
#main #content h1,
#main .col-inner h1,
#main .entry-title,
#main h1.entry-title {
  color: {$h1_color} !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
}

#main #content h1 strong,
#main .col-inner h1 strong {
  color: {$h1_color} !important;
}

#main #content h2,
#main .col-inner h2 {
  color: {$h2_color} !important;
  font-weight: 700 !important;
  border-bottom: 2px solid rgba(56, 189, 248, 0.25) !important;
  padding-bottom: 6px !important;
  margin-top: 1.8em !important;
  margin-bottom: 0.8em !important;
}

#main #content h2 strong,
#main .col-inner h2 strong {
  color: {$h2_color} !important;
}

#main #content h3,
#main .col-inner h3 {
  color: {$h3_color} !important;
  font-weight: 700 !important;
  margin-top: 1.4em !important;
  margin-bottom: 0.6em !important;
}

#main #content h3 strong,
#main .col-inner h3 strong {
  color: {$h3_color} !important;
}

/* Chỉ gạch dưới các link văn bản bên trong bài viết/trang (không ảnh hưởng menu) */
#main #content .col-inner p a:not(.button):not(.ez-toc-btn),
#main #content .col-inner li a:not(.button):not(.ez-toc-btn),
#main #content .entry-content p a:not(.button):not(.ez-toc-btn),
#main #content .entry-content li a:not(.button):not(.ez-toc-btn) {
  color: {$link_color} !important;
  text-decoration: underline !important;
  text-underline-offset: 3px !important;
  transition: color 0.2s ease !important;
}

#main #content .col-inner p a:not(.button):not(.ez-toc-btn):hover,
#main #content .col-inner li a:not(.button):not(.ez-toc-btn):hover,
#main #content .entry-content p a:not(.button):not(.ez-toc-btn):hover,
#main #content .entry-content li a:not(.button):not(.ez-toc-btn):hover {
  color: {$link_hover} !important;
}

/* Image Captions */
#main figcaption {
  color: #94a3b8 !important;
  font-size: 13px !important;
}

/* Khung 1: Table of Contents Box (Ghi đè hoàn toàn Easy TOC, LuckyWP và Custom TOC) */
div#ez-toc-container,
div#ez-toc-container.ez-toc-grey,
div#ez-toc-container.ez-toc-light-blue,
div#ez-toc-container.ez-toc-white,
#ez-toc-container,
.lwptoc,
.toc-box,
.autoweb-toc {
  background-color: {$toc_bg} !important;
  background: {$toc_bg} !important;
  border: 1.5px solid {$toc_border} !important;
  border-radius: {$toc_radius} !important;
  padding: 16px 20px !important;
  box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.6) !important;
  margin: 24px 0 !important;
}

div#ez-toc-container .ez-toc-title,
#ez-toc-container .ez-toc-title,
.lwptoc_header,
.autoweb-toc-title {
  color: {$toc_title} !important;
  font-weight: 700 !important;
  font-size: 15px !important;
}

div#ez-toc-container ul li,
div#ez-toc-container ul li a,
#ez-toc-container ul li a,
.lwptoc a,
.autoweb-toc a {
  color: {$toc_link} !important;
  text-decoration: none !important;
  font-size: 13.5px !important;
  transition: all 0.2s ease !important;
}

div#ez-toc-container ul li a:hover,
#ez-toc-container ul li a:hover,
.lwptoc a:hover,
.autoweb-toc a:hover {
  color: {$link_hover} !important;
  padding-left: 4px !important;
}

div#ez-toc-container .ez-toc-title-toggle svg {
  fill: #94a3b8 !important;
  color: #94a3b8 !important;
}

/* Khung 2: Thẻ Meta Badges / Pills */
.autoweb-badge,
.tag-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 14px !important;
  border-radius: {$badge_radius} !important;
  background-color: {$badge_bg} !important;
  border: 1.5px solid {$badge_border} !important;
  color: {$badge_text} !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
  margin-right: 8px !important;
  margin-bottom: 8px !important;
}
.autoweb-badge.badge-gold { border-color: #eab308 !important; color: #fef08a !important; }
.autoweb-badge.badge-blue { border-color: #38bdf8 !important; color: #bae6fd !important; }
.autoweb-badge.badge-green { border-color: #10b981 !important; color: #a7f3d0 !important; }

/* Khung 3: Hộp Callout Nổi Bật (Khuyến mãi, Lưu ý, Tip) */
.autoweb-callout {
  background-color: {$callout_bg} !important;
  border-radius: {$callout_radius} !important;
  padding: 18px 22px !important;
  margin: 24px 0 !important;
  border-left: 5px solid {$callout_gold} !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3) !important;
  backdrop-filter: blur(8px) !important;
}
.autoweb-callout.callout-gold { border-left-color: {$callout_gold} !important; }
.autoweb-callout.callout-blue { border-left-color: {$callout_blue} !important; }
.autoweb-callout.callout-green { border-left-color: {$callout_green} !important; }
.autoweb-callout.callout-border-all { border: 2px solid {$callout_gold} !important; }

/* Khung 4: Nút CTA Kêu Gọi Hành Động Giữa Bài */
.autoweb-cta-box {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%) !important;
  border: 1.5px solid rgba(234, 179, 8, 0.4) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  text-align: center !important;
  margin: 32px 0 !important;
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.5) !important;
}
.autoweb-cta-box h3 {
  color: #ffffff !important;
  margin-top: 0 !important;
  margin-bottom: 8px !important;
  font-size: 20px !important;
}
.autoweb-cta-box p {
  color: #cbd5e1 !important;
  margin-bottom: 16px !important;
  font-size: 14px !important;
}

/* Khung 5: Bảng Dữ Liệu Tỷ Lệ & So Sánh */
.entry-content table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
  width: 100% !important;
  border-radius: {$tb_radius} !important;
  border: 1px solid {$tb_border} !important;
  overflow: hidden !important;
  margin: 24px 0 !important;
}
.entry-content table th {
  background-color: {$th_bg} !important;
  color: {$th_color} !important;
  padding: 12px 16px !important;
  font-weight: 700 !important;
  border-bottom: 2px solid {$tb_border} !important;
}
.entry-content table td {
  padding: 10px 16px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.entry-content table tr:nth-child(even) td {
  background-color: rgba(255, 255, 255, 0.02) !important;
}
.entry-content table tr:hover td {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* User Custom Override */
{$custom_css}
";

        // Cấu hình Post & Suggested Posts & Sidebar
        $post_cols = !empty($styling['relatedPostsColumns']) ? intval($styling['relatedPostsColumns']) : 3;
        if ($post_cols < 2 || $post_cols > 4) $post_cols = 3;

        $css .= "
/* ==============================================================
   Flatsome AutoTheme: Bài Viết Gợi Ý Dưới Chân Bài Viết (Related Posts)
   ============================================================== */
.autoweb-related-posts-section {
  margin-top: 48px !important;
  padding-top: 32px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  clear: both !important;
}
.autoweb-related-header {
  margin-bottom: 22px !important;
}
.autoweb-related-badge {
  display: inline-block !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  padding: 4px 12px !important;
  border-radius: 99px !important;
  background: rgba(56, 189, 248, 0.15) !important;
  color: #38bdf8 !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  margin-bottom: 8px !important;
}
.autoweb-related-title {
  color: #ffffff !important;
  font-size: 20px !important;
  font-weight: 800 !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.autoweb-related-grid {
  display: grid !important;
  grid-template-columns: repeat({$post_cols}, 1fr) !important;
  gap: 20px !important;
}
@media (max-width: 850px) {
  .autoweb-related-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 550px) {
  .autoweb-related-grid {
    grid-template-columns: 1fr !important;
  }
}
.autoweb-related-card {
  display: flex !important;
  flex-direction: column !important;
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  text-decoration: none !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25) !important;
}
.autoweb-related-card:hover {
  transform: translateY(-4px) !important;
  border-color: rgba(56, 189, 248, 0.45) !important;
  box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.2) !important;
}
.autoweb-related-thumb {
  position: relative !important;
  width: 100% !important;
  aspect-ratio: 16 / 9 !important;
  overflow: hidden !important;
  background: #0b0f19 !important;
}
.autoweb-related-thumb img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  transition: transform 0.4s ease !important;
}
.autoweb-related-card:hover .autoweb-related-thumb img {
  transform: scale(1.06) !important;
}
.autoweb-related-category {
  position: absolute !important;
  top: 10px !important;
  left: 10px !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  padding: 3px 8px !important;
  border-radius: 6px !important;
  background: rgba(0, 0, 0, 0.75) !important;
  color: #fde047 !important;
  border: 1px solid rgba(253, 224, 71, 0.4) !important;
  backdrop-filter: blur(4px) !important;
}
.autoweb-related-body {
  padding: 14px 16px !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  justify-content: space-between !important;
}
.autoweb-related-post-title {
  color: #f8fafc !important;
  font-size: 14.5px !important;
  font-weight: 700 !important;
  line-height: 1.4 !important;
  margin: 0 0 10px 0 !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  transition: color 0.2s ease !important;
}
.autoweb-related-card:hover .autoweb-related-post-title {
  color: #38bdf8 !important;
}
.autoweb-related-meta {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  font-size: 11px !important;
  color: #94a3b8 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding-top: 8px !important;
  margin-top: auto !important;
}
.autoweb-related-read {
  color: #38bdf8 !important;
  font-weight: 600 !important;
  transition: transform 0.2s ease !important;
}
.autoweb-related-card:hover .autoweb-related-read {
  transform: translateX(3px) !important;
}

/* ==============================================================
   Flatsome AutoTheme: Cột Bên Phải Bài Viết (Right Sidebar VIP)
   ============================================================== */
#secondary .autoweb-sidebar-widget {
  background: rgba(15, 23, 42, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 14px !important;
  padding: 18px 20px !important;
  margin-bottom: 22px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(8px) !important;
}
.autoweb-sidebar-widget-title {
  font-size: 13.5px !important;
  font-weight: 800 !important;
  color: #fde047 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  border-bottom: 2px solid rgba(253, 224, 71, 0.25) !important;
  padding-bottom: 10px !important;
  margin-bottom: 14px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.autoweb-sidebar-posts-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}
.autoweb-sidebar-post-item {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  text-decoration: none !important;
  padding-bottom: 10px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  transition: all 0.2s ease !important;
}
.autoweb-sidebar-post-item:last-child {
  border-bottom: none !important;
  padding-bottom: 0 !important;
}
.autoweb-sidebar-post-thumb {
  width: 58px !important;
  height: 58px !important;
  border-radius: 8px !important;
  object-fit: cover !important;
  background: #0b0f19 !important;
  flex-shrink: 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.autoweb-sidebar-post-info {
  flex: 1 !important;
  min-width: 0 !important;
}
.autoweb-sidebar-post-title {
  color: #f1f5f9 !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  line-height: 1.35 !important;
  margin: 0 0 4px 0 !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  transition: color 0.2s ease !important;
}
.autoweb-sidebar-post-item:hover .autoweb-sidebar-post-title {
  color: #38bdf8 !important;
}
.autoweb-sidebar-post-date {
  color: #64748b !important;
  font-size: 10.5px !important;
  display: block !important;
}

/* Sidebar CTA Khuyến Mãi */
.autoweb-sidebar-widget.autoweb-sidebar-cta {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%) !important;
  border: 1.5px solid rgba(234, 179, 8, 0.45) !important;
  text-align: center !important;
  position: relative !important;
  overflow: hidden !important;
}
.autoweb-cta-badge {
  display: inline-block !important;
  font-size: 9.5px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  background: #eab308 !important;
  color: #0f172a !important;
  padding: 3px 10px !important;
  border-radius: 99px !important;
  margin-bottom: 10px !important;
}
.autoweb-cta-sidebar-title {
  color: #ffffff !important;
  font-size: 16px !important;
  font-weight: 800 !important;
  margin: 0 0 6px 0 !important;
}
.autoweb-cta-sidebar-desc {
  color: #cbd5e1 !important;
  font-size: 12px !important;
  line-height: 1.45 !important;
  margin: 0 0 14px 0 !important;
}
.autoweb-cta-sidebar-btn {
  width: 100% !important;
  border-radius: 99px !important;
  font-weight: 800 !important;
  font-size: 12px !important;
  padding: 10px 16px !important;
  text-align: center !important;
  background: #ef4444 !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4) !important;
  transition: all 0.2s ease !important;
  display: inline-block !important;
}
.autoweb-cta-sidebar-btn:hover {
  background: #dc2626 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6) !important;
}
";

        if (!empty($styling['sidebarCleanOnly'])) {
            $css .= "
/* Chế độ Sidebar Tinh Gọn: Ẩn các widget mặc định cũ của WordPress */
#secondary > aside:not(.autoweb-sidebar-widget),
#secondary > div:not(.autoweb-sidebar-widget):not(.is-sticky-column) {
  display: none !important;
}
";
        }

        if (!empty($styling['sidebarSticky'])) {
            $css .= "
/* Sticky Sidebar cố định khi cuộn trên máy tính */
@media (min-width: 850px) {
  .post-sidebar, #secondary {
    position: -webkit-sticky !important;
    position: sticky !important;
    top: 90px !important;
    z-index: 10 !important;
  }
}
";
        }

        $css .= "
/* Flatsome AutoTheme: Blog Share Icons Enhancement */
.blog-share {
  margin: 30px 0 20px 0 !important;
}
.blog-share .is-divider {
  background-color: rgba(255, 255, 255, 0.12) !important;
  height: 1px !important;
  margin: 0 auto 18px auto !important;
}
.blog-share .share-icons-title {
  display: block !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: #cbd5e1 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  margin-bottom: 12px !important;
}
.blog-share .share-icons a {
  margin: 0 4px !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  color: #cbd5e1 !important;
  transition: all 0.25s ease !important;
}
.blog-share .share-icons a:hover {
  border-color: #38bdf8 !important;
  color: #38bdf8 !important;
  transform: translateY(-3px) scale(1.1) !important;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3) !important;
}
";

        if (empty($styling['postFooterMetaEnabled'])) {
            $css .= "
/* Ẩn dòng thông tin chân bài thô sơ cổ điển của Flatsome ('This entry was posted in... Bookmark permalink') */
footer.entry-meta, .entry-footer .entry-meta, .blog-single footer.entry-meta {
  display: none !important;
}
";
        }

        $css .= "
/* ============================================================== */
/* KHUNG TÁC GIẢ BÀI VIẾT (AUTOWEB VIP AUTHOR BOX - CHUẨN E-E-A-T) */
/* ============================================================== */
.autoweb-author-box {
  margin: 40px 0 32px 0 !important;
  padding: 24px 28px !important;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%) !important;
  border: 1px solid rgba(234, 179, 8, 0.35) !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35) !important;
  display: flex !important;
  align-items: flex-start !important;
  gap: 22px !important;
  position: relative !important;
  overflow: hidden !important;
}
.autoweb-author-box::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 5px !important;
  height: 100% !important;
  background: linear-gradient(180deg, #eab308 0%, #38bdf8 100%) !important;
}
.autoweb-author-avatar-wrap {
  position: relative !important;
  flex-shrink: 0 !important;
}
.autoweb-author-avatar {
  width: 80px !important;
  height: 80px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  border: 3px solid #eab308 !important;
  box-shadow: 0 4px 14px rgba(234, 179, 8, 0.3) !important;
  display: block !important;
  background: #0f172a !important;
}
.autoweb-author-check {
  position: absolute !important;
  bottom: 0 !important;
  right: 0 !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  background: #10b981 !important;
  color: #ffffff !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 2px solid #0f172a !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
}
.autoweb-author-content {
  flex: 1 !important;
  min-width: 0 !important;
}
.autoweb-author-header {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  gap: 16px !important;
  flex-wrap: wrap !important;
  margin-bottom: 10px !important;
}
.autoweb-author-title-group {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}
.autoweb-author-badge {
  display: inline-block !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  color: #eab308 !important;
  background: rgba(234, 179, 8, 0.12) !important;
  border: 1px solid rgba(234, 179, 8, 0.3) !important;
  padding: 2px 8px !important;
  border-radius: 99px !important;
  width: fit-content !important;
}
.autoweb-author-name {
  margin: 0 !important;
  font-size: 18px !important;
  font-weight: 800 !important;
  line-height: 1.3 !important;
}
.autoweb-author-name a {
  color: #ffffff !important;
  text-decoration: none !important;
  transition: color 0.2s ease !important;
}
.autoweb-author-name a:hover {
  color: #38bdf8 !important;
}
.autoweb-author-role {
  font-size: 12px !important;
  color: #94a3b8 !important;
  font-weight: 600 !important;
}
.autoweb-author-posts-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 14px !important;
  border-radius: 99px !important;
  background: rgba(56, 189, 248, 0.12) !important;
  border: 1px solid rgba(56, 189, 248, 0.35) !important;
  color: #38bdf8 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
}
.autoweb-author-posts-btn:hover {
  background: #38bdf8 !important;
  color: #040817 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3) !important;
}
.autoweb-author-bio {
  margin: 0 !important;
  font-size: 13.5px !important;
  line-height: 1.65 !important;
  color: #cbd5e1 !important;
}
.entry-author.author-box {
  display: none !important;
}
@media (max-width: 640px) {
  .autoweb-author-box {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    padding: 20px 18px !important;
  }
  .autoweb-author-title-group {
    align-items: center !important;
  }
  .autoweb-author-header {
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .autoweb-author-box::before {
    width: 100% !important;
    height: 4px !important;
    top: 0 !important;
    left: 0 !important;
  }
}
";

        return trim($css);
    }

    public function filter_blog_post_layout($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && !empty($styling['postLayout'])) {
            return $styling['postLayout'];
        }
        return !empty($val) ? $val : 'right-sidebar';
    }

    public function filter_blog_sticky_sidebar($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && isset($styling['sidebarSticky'])) {
            return !empty($styling['sidebarSticky']);
        }
        return true;
    }

    public function filter_blog_share($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && isset($styling['postShareEnabled'])) {
            return !empty($styling['postShareEnabled']) ? 1 : 0;
        }
        return 1;
    }

    public function filter_social_icons($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && !empty($styling['postShareNetworks']) && is_array($styling['postShareNetworks'])) {
            return $styling['postShareNetworks'];
        }
        return $val;
    }

    public function filter_social_icons_style($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && !empty($styling['postShareStyle'])) {
            return sanitize_text_field($styling['postShareStyle']);
        }
        return !empty($val) ? $val : 'outline';
    }

    public function filter_blog_author_box($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && isset($styling['postAuthorBoxEnabled'])) {
            return !empty($styling['postAuthorBoxEnabled']) ? 1 : 0;
        }
        return $val;
    }

    public function filter_blog_single_next_prev_nav($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && isset($styling['postNavEnabled'])) {
            return !empty($styling['postNavEnabled']) ? 1 : 0;
        }
        return $val;
    }

    public function filter_blog_single_footer_meta($val) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling) && isset($styling['postFooterMetaEnabled'])) {
            return !empty($styling['postFooterMetaEnabled']) ? 1 : 0;
        }
        return 0; // Mặc định ẩn hoàn toàn dòng chữ cổ điển này để website sạch sẽ chuẩn SEO!
    }

    public function filter_share_shortcode_atts($out, $pairs, $atts) {
        $styling = get_option('flatsome_seo_subpage_styling', null);
        if (!empty($styling) && is_array($styling)) {
            if (!empty($styling['postShareTitle'])) {
                $out['title'] = esc_html($styling['postShareTitle']);
            }
            if (!empty($styling['postShareAlign'])) {
                $out['align'] = sanitize_text_field($styling['postShareAlign']);
            }
            if (!empty($styling['postShareStyle'])) {
                $out['style'] = sanitize_text_field($styling['postShareStyle']);
            }
        }
        return $out;
    }

    public function inject_related_posts_to_content($content) {
        if (!is_single() && !is_singular('post')) {
            return $content;
        }
        if (is_feed()) {
            return $content;
        }
        static $bottom_injected = false;
        if ($bottom_injected) {
            return $content;
        }

        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (!is_array($styling)) {
            $styling = array();
        }

        $extra_html = '';

        // 1. Author Box (Khung Tác Giả & Chuẩn E-E-A-T Google)
        if (!empty($styling['postAuthorBoxEnabled'])) {
            $extra_html .= $this->render_author_box_html($styling);
        }

        // 2. Related Posts (Lưới Bài Viết Gợi Ý)
        $show_related = !isset($styling['relatedPostsEnabled']) || !empty($styling['relatedPostsEnabled']);
        if ($show_related) {
            $extra_html .= $this->render_related_posts_html($styling);
        }

        if (empty($extra_html)) {
            return $content;
        }

        $bottom_injected = true;
        return $content . $extra_html;
    }

    public function render_author_box_html($styling) {
        $current_id = get_queried_object_id() ?: get_the_ID();
        $author_id = get_post_field('post_author', $current_id);
        if (!$author_id) {
            $author_id = 1;
        }

        $author_name = !empty($styling['postAuthorName'])
            ? esc_html($styling['postAuthorName'])
            : esc_html(get_the_author_meta('display_name', $author_id) ?: 'Carlos Mendoza');

        $author_role = !empty($styling['postAuthorRole'])
            ? esc_html($styling['postAuthorRole'])
            : 'Autor & Analista Experto';

        $author_badge = !empty($styling['postAuthorBadge'])
            ? esc_html($styling['postAuthorBadge'])
            : 'Autor Verificado';

        $author_avatar = !empty($styling['postAuthorAvatar'])
            ? esc_url($styling['postAuthorAvatar'])
            : esc_url(get_avatar_url($author_id, array('size' => 128)));

        $author_link = !empty($styling['postAuthorLink'])
            ? esc_url($styling['postAuthorLink'])
            : esc_url(get_author_posts_url($author_id));

        $wp_bio = get_the_author_meta('description', $author_id);
        $author_bio = !empty($styling['postAuthorBio'])
            ? esc_html($styling['postAuthorBio'])
            : (!empty($wp_bio) ? esc_html($wp_bio) : 'Especialista en análisis de casinos, slots con alto RTP y apuestas deportivas en México y Latinoamérica. Comprometido con el juego responsable y estrategias verificadas.');

        ob_start();
        ?>
        <div class="autoweb-author-box">
            <div class="autoweb-author-avatar-wrap">
                <img src="<?php echo $author_avatar; ?>" alt="<?php echo $author_name; ?>" class="autoweb-author-avatar" loading="lazy" />
                <span class="autoweb-author-check" title="Tác giả uy tín">✓</span>
            </div>
            <div class="autoweb-author-content">
                <div class="autoweb-author-header">
                    <div class="autoweb-author-title-group">
                        <span class="autoweb-author-badge"><?php echo $author_badge; ?></span>
                        <h4 class="autoweb-author-name">
                            <a href="<?php echo $author_link; ?>"><?php echo $author_name; ?></a>
                        </h4>
                        <span class="autoweb-author-role"><?php echo $author_role; ?></span>
                    </div>
                    <?php if (!empty($author_link)): ?>
                        <a href="<?php echo $author_link; ?>" class="autoweb-author-posts-btn">
                            <span>Ver Todos Los Artículos</span>
                            <span>➔</span>
                        </a>
                    <?php endif; ?>
                </div>
                <p class="autoweb-author-bio"><?php echo $author_bio; ?></p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    public function render_related_posts_html($styling) {
        $current_id = get_queried_object_id() ?: get_the_ID();
        $title = !empty($styling['relatedPostsTitle']) ? $styling['relatedPostsTitle'] : 'Artículos Relacionados';
        $count = !empty($styling['relatedPostsCount']) ? intval($styling['relatedPostsCount']) : 3;
        $cols = !empty($styling['relatedPostsColumns']) ? intval($styling['relatedPostsColumns']) : 3;
        if ($count < 1) $count = 3;
        if ($cols < 2 || $cols > 4) $cols = 3;

        $cats = wp_get_post_categories($current_id);
        $args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $count,
            'post__not_in' => array($current_id),
            'orderby' => 'date',
            'order' => 'DESC'
        );
        if (!empty($cats) && (!isset($styling['relatedPostsSource']) || $styling['relatedPostsSource'] === 'category')) {
            $args['category__in'] = $cats;
        }

        $query = new WP_Query($args);
        if ($query->post_count < $count) {
            $needed = $count - $query->post_count;
            $exclude_ids = array_merge(array($current_id), wp_list_pluck($query->posts, 'ID'));
            $fallback_query = new WP_Query(array(
                'post_type' => 'post',
                'post_status' => 'publish',
                'posts_per_page' => $needed,
                'post__not_in' => $exclude_ids,
                'orderby' => 'date',
                'order' => 'DESC'
            ));
            if (!empty($fallback_query->posts)) {
                $query->posts = array_merge($query->posts, $fallback_query->posts);
                $query->post_count = count($query->posts);
            }
        }

        if (empty($query->posts)) {
            return '';
        }

        ob_start();
        ?>
        <div class="autoweb-related-posts-section">
            <div class="autoweb-related-header">
                <span class="autoweb-related-badge">RECOMENDADO</span>
                <h3 class="autoweb-related-title"><?php echo esc_html($title); ?></h3>
            </div>
            <div class="autoweb-related-grid columns-<?php echo esc_attr($cols); ?>">
                <?php foreach ($query->posts as $p):
                    $pid = $p->ID;
                    $permalink = get_permalink($pid);
                    $post_title = get_the_title($pid);
                    $thumb = get_the_post_thumbnail_url($pid, 'medium_large');
                    if (!$thumb) {
                        $thumb = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.4)%3Bfont-weight%3Abold%3Bfont-family%3Asans-serif%3Bfont-size%3A18pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22225%22%20fill%3D%22%231e293b%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22140%22%20y%3D%22120%22%3EJUEGALOTTO%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }
                    $post_cats = get_the_category($pid);
                    $cat_name = !empty($post_cats[0]) ? $post_cats[0]->name : 'ARTÍCULO';
                    $post_date = get_the_date('d M, Y', $pid);
                ?>
                <a href="<?php echo esc_url($permalink); ?>" class="autoweb-related-card">
                    <div class="autoweb-related-thumb">
                        <img src="<?php echo esc_url($thumb); ?>" alt="<?php echo esc_attr($post_title); ?>" loading="lazy" />
                        <span class="autoweb-related-category"><?php echo esc_html($cat_name); ?></span>
                    </div>
                    <div class="autoweb-related-body">
                        <h4 class="autoweb-related-post-title"><?php echo esc_html($post_title); ?></h4>
                        <div class="autoweb-related-meta">
                            <span class="autoweb-related-date">📅 <?php echo esc_html($post_date); ?></span>
                            <span class="autoweb-related-read">Leer ➔</span>
                        </div>
                    </div>
                </a>
                <?php endforeach; wp_reset_postdata(); ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    public function inject_custom_sidebar_widgets() {
        if (!is_single() && !is_singular('post')) {
            return;
        }
        static $sidebar_injected = false;
        if ($sidebar_injected) {
            return;
        }
        $sidebar_injected = true;

        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (!is_array($styling)) {
            $styling = array();
        }

        $current_id = get_queried_object_id() ?: get_the_ID();

        $show_suggested = !isset($styling['sidebarSuggestedPostsEnabled']) || !empty($styling['sidebarSuggestedPostsEnabled']);
        $show_cta = !isset($styling['sidebarCtaEnabled']) || !empty($styling['sidebarCtaEnabled']);

        // 1. Widget Bài viết gợi ý / đọc nhiều ở Sidebar
        if ($show_suggested) {
            $side_title = !empty($styling['sidebarSuggestedPostsTitle']) ? $styling['sidebarSuggestedPostsTitle'] : 'Artículos Recomendados';
            $side_count = !empty($styling['sidebarSuggestedPostsCount']) ? intval($styling['sidebarSuggestedPostsCount']) : 5;
            if ($side_count < 1) $side_count = 5;

            $side_posts = get_posts(array(
                'post_type' => 'post',
                'post_status' => 'publish',
                'posts_per_page' => $side_count,
                'post__not_in' => array($current_id),
                'orderby' => 'date',
                'order' => 'DESC'
            ));

            if (!empty($side_posts)) {
                echo '<div class="autoweb-sidebar-widget autoweb-sidebar-posts">';
                echo '<div class="autoweb-sidebar-widget-title"><span>🔥</span> ' . esc_html($side_title) . '</div>';
                echo '<div class="autoweb-sidebar-posts-list">';
                foreach ($side_posts as $sp) {
                    $slink = get_permalink($sp->ID);
                    $stitle = get_the_title($sp->ID);
                    $sthumb = get_the_post_thumbnail_url($sp->ID, 'thumbnail');
                    if (!$sthumb) {
                        $sthumb = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%231e293b%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2228%22%20y%3D%2248%22%20fill%3D%22%23fde047%22%20font-size%3D%2222%22%3E%E2%98%85%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }
                    $sdate = get_the_date('d M, Y', $sp->ID);
                    echo '<a href="' . esc_url($slink) . '" class="autoweb-sidebar-post-item">';
                    echo '<img class="autoweb-sidebar-post-thumb" src="' . esc_url($sthumb) . '" alt="' . esc_attr($stitle) . '" loading="lazy" />';
                    echo '<div class="autoweb-sidebar-post-info">';
                    echo '<h5 class="autoweb-sidebar-post-title">' . esc_html($stitle) . '</h5>';
                    echo '<span class="autoweb-sidebar-post-date">' . esc_html($sdate) . '</span>';
                    echo '</div>';
                    echo '</a>';
                }
                echo '</div></div>';
            }
        }

        // 2. Widget Box CTA Khuyến Mãi ở Sidebar
        if ($show_cta) {
            $cta_title = !empty($styling['sidebarCtaTitle']) ? $styling['sidebarCtaTitle'] : 'Bono Exclusivo 100%';
            $cta_desc = !empty($styling['sidebarCtaDesc']) ? $styling['sidebarCtaDesc'] : 'Regístrate hoy y duplica tu primer depósito.';
            $cta_btn = !empty($styling['sidebarCtaBtnText']) ? $styling['sidebarCtaBtnText'] : 'REGÍSTRATE AHORA';
            $cta_link = !empty($styling['sidebarCtaBtnLink']) ? $styling['sidebarCtaBtnLink'] : '#register';

            echo '<div class="autoweb-sidebar-widget autoweb-sidebar-cta">';
            echo '<div class="autoweb-cta-badge">OFERTA VIP</div>';
            echo '<h4 class="autoweb-cta-sidebar-title">' . esc_html($cta_title) . '</h4>';
            echo '<p class="autoweb-cta-sidebar-desc">' . esc_html($cta_desc) . '</p>';
            echo '<a href="' . esc_url($cta_link) . '" rel="nofollow" class="button autoweb-cta-sidebar-btn">' . esc_html($cta_btn) . ' ➔</a>';
            echo '</div>';
        }
    }

    /**
     * Vô hiệu hóa template mặc định của Flatsome (ngăn không cho Flatsome gọi archive-title.php)
     * Triệt tiêu hoàn toàn node chữ "Category Archives: " ở mức mã nguồn PHP trả về từ máy chủ
     */
    public function filter_disable_flatsome_default_archive_title($val) {
        if (is_admin()) {
            return $val;
        }
        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (empty($styling)) {
            $styling = get_option('autoweb_subpage_styling', array());
        }
        if (isset($styling['stripArchiveTitlePrefix']) && $styling['stripArchiveTitlePrefix'] === false) {
            return $val;
        }

        // Tắt tiêu đề archive mặc định của Flatsome khi ở trang chuyên mục hoặc tìm kiếm
        if (is_archive() || is_search()) {
            return 0;
        }
        return $val;
    }

    /**
     * Xuất mã HTML tiêu đề Archive hoàn toàn sạch không chứa chữ "Category Archives:"
     */
    public function render_clean_flatsome_archive_title() {
        if (!is_archive() && !is_search()) {
            return;
        }
        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (empty($styling)) {
            $styling = get_option('autoweb_subpage_styling', array());
        }
        if (isset($styling['stripArchiveTitlePrefix']) && $styling['stripArchiveTitlePrefix'] === false) {
            return;
        }

        echo "\n<!-- Flatsome AutoTheme Clean Archive Header (No 'Category Archives:' Text Node) -->\n";
        echo '<header class="archive-page-header">' . "\n";
        echo '  <div class="row">' . "\n";
        echo '    <div class="large-12 text-center col">' . "\n";
        echo '      <h1 class="page-title is-large uppercase">' . "\n";

        if (is_category()) {
            echo '        <span>' . single_cat_title('', false) . '</span>' . "\n";
        } elseif (is_tag()) {
            echo '        <span>' . single_tag_title('', false) . '</span>' . "\n";
        } elseif (is_search()) {
            printf('        <span>' . esc_html__('Search Results for: %s', 'flatsome') . '</span>' . "\n", get_search_query());
        } elseif (is_author()) {
            the_post();
            echo '        <span class="vcard"><a class="url fn n" href="' . esc_url(get_author_posts_url(get_the_author_meta('ID'))) . '" title="' . esc_attr(get_the_author()) . '" rel="me">' . esc_html(get_the_author()) . '</a></span>' . "\n";
            rewind_posts();
        } elseif (is_day()) {
            echo '        <span>' . get_the_date() . '</span>' . "\n";
        } elseif (is_month()) {
            echo '        <span>' . get_the_date('F Y') . '</span>' . "\n";
        } elseif (is_year()) {
            echo '        <span>' . get_the_date('Y') . '</span>' . "\n";
        } else {
            the_archive_title('        <span>', '</span>' . "\n");
        }

        echo '      </h1>' . "\n";

        if (is_category()) {
            $category_description = category_description();
            if (!empty($category_description)) {
                echo apply_filters('category_archive_meta', '<div class="taxonomy-description">' . $category_description . '</div>' . "\n");
            }
        } elseif (is_tag()) {
            $tag_description = tag_description();
            if (!empty($tag_description)) {
                echo apply_filters('tag_archive_meta', '<div class="taxonomy-description">' . $tag_description . '</div>' . "\n");
            }
        }

        echo '    </div>' . "\n";
        echo '  </div>' . "\n";
        echo '</header>' . "\n";
    }

    /**
     * Loại bỏ chữ "Category Archives: ", "Tag Archives: ", "Author Archives: " trong Flatsome & WordPress
     * Giúp tiêu đề chuyên mục hiển thị sạch sẽ, chuyên nghiệp chuẩn SEO (ví dụ: GUÍAS thay vì CATEGORY ARCHIVES: GUÍAS)
     */
    public function filter_remove_archive_title_prefix($translated_text, $text, $domain) {
        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (empty($styling)) {
            $styling = get_option('autoweb_subpage_styling', array());
        }
        if (isset($styling['stripArchiveTitlePrefix']) && $styling['stripArchiveTitlePrefix'] === false) {
            return $translated_text;
        }

        // 1. Khớp chính xác các chuỗi gốc tiếng Anh trong template Flatsome: archive-title.php
        $strip_exact = array(
            'Category Archives: %s',
            'Tag Archives: %s',
            'Author Archives: %s',
            'Daily Archives: %s',
            'Monthly Archives: %s',
            'Yearly Archives: %s',
            'Archives: %s',
            'Category: %s',
            'Tag: %s',
            'Author: %s',
        );

        if (in_array($text, $strip_exact, true)) {
            return '%s';
        }

        // 2. Nếu chuỗi text gốc chứa "Category Archives:"
        if (strpos($text, 'Category Archives:') !== false) {
            return '%s';
        }

        // 3. Nếu là giao diện Frontend và trang đang là Archive/Category/Tag
        if (!is_admin() && (is_archive() || is_category() || is_tag() || is_author())) {
            $prefixes = array(
                'Category Archives: ',
                'Category Archives:',
                'Tag Archives: ',
                'Tag Archives:',
                'Author Archives: ',
                'Author Archives:',
                'Archivos de Categoría: ',
                'Archivos de Categoría:',
                'Archivos de Etiquetas: ',
                'Archivos de Etiquetas:',
                'Archivos de Autor: ',
                'Archivos de Autor:',
                'Lưu trữ chuyên mục: ',
                'Lưu trữ chuyên mục:',
                'Lưu trữ thẻ: ',
                'Lưu trữ thẻ:',
                'Lưu trữ tác giả: ',
                'Lưu trữ tác giả:',
                'Chuyên mục: ',
                'Thẻ: ',
                'Tác giả: ',
                'Categoría: ',
                'Etiqueta: ',
                'Autor: ',
            );
            foreach ($prefixes as $pfx) {
                if (stripos($translated_text, $pfx) === 0) {
                    return trim(substr($translated_text, strlen($pfx)));
                }
            }
        }

        return $translated_text;
    }

    /**
     * Bộ lọc tiêu chuẩn WordPress Core cho get_the_archive_title()
     */
    public function filter_strip_archive_title_prefix($title) {
        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (empty($styling)) {
            $styling = get_option('autoweb_subpage_styling', array());
        }
        if (isset($styling['stripArchiveTitlePrefix']) && $styling['stripArchiveTitlePrefix'] === false) {
            return $title;
        }

        if (is_category()) {
            return single_cat_title('', false);
        } elseif (is_tag()) {
            return single_tag_title('', false);
        } elseif (is_author()) {
            return get_the_author();
        } elseif (is_year()) {
            return get_the_date('Y');
        } elseif (is_month()) {
            return get_the_date('F Y');
        } elseif (is_day()) {
            return get_the_date('F j, Y');
        } elseif (is_post_type_archive()) {
            return post_type_archive_title('', false);
        } elseif (is_tax()) {
            return single_term_title('', false);
        }
        return $title;
    }

    /**
     * Ẩn link category nhỏ lặp lại (entry-category) trên từng bài viết ở trang Category & Archive
     */
    public function filter_remove_entry_category_on_archive($thelist, $separator = '', $parents = '') {
        if (!is_admin() && (is_archive() || is_category() || is_tag() || is_home() || is_search())) {
            $styling = get_option('flatsome_seo_subpage_styling', array());
            if (empty($styling)) {
                $styling = get_option('autoweb_subpage_styling', array());
            }
            if (!isset($styling['hideArchiveCategoryBadge']) || !empty($styling['hideArchiveCategoryBadge'])) {
                return '';
            }
        }
        return $thelist;
    }

    public function filter_remove_entry_category_list_on_archive($categories, $post_id = 0) {
        if (!is_admin() && (is_archive() || is_category() || is_tag() || is_home() || is_search())) {
            $styling = get_option('flatsome_seo_subpage_styling', array());
            if (empty($styling)) {
                $styling = get_option('autoweb_subpage_styling', array());
            }
            if (!isset($styling['hideArchiveCategoryBadge']) || !empty($styling['hideArchiveCategoryBadge'])) {
                return array();
            }
        }
        return $categories;
    }

    /**
     * Bắt đầu bộ đệm (Output Buffer) xóa triệt để thẻ <h6 class="entry-category"> khỏi DOM ở danh sách bài viết
     */
    public function start_archive_entry_category_buffer() {
        if (!is_admin() && (is_archive() || is_category() || is_tag() || is_home() || is_search())) {
            $styling = get_option('flatsome_seo_subpage_styling', array());
            if (empty($styling)) {
                $styling = get_option('autoweb_subpage_styling', array());
            }
            if (!isset($styling['hideArchiveCategoryBadge']) || !empty($styling['hideArchiveCategoryBadge'])) {
                ob_start(array($this, 'clean_archive_entry_category_html'));
            }
        }
    }

    public function end_archive_entry_category_buffer() {
        if (ob_get_level() > 0) {
            ob_end_flush();
        }
    }

    public function clean_archive_entry_category_html($html) {
        if (empty($html)) {
            return $html;
        }
        // Xóa hoàn toàn thẻ <h6 class="entry-category ...">...</h6> khỏi DOM HTML bài viết
        return preg_replace('/<h6\s+class="entry-category[^"]*">[\s\S]*?<\/h6>\s*/i', '', $html);
    }

    /**
     * Xuất thanh điều hướng phân cấp Rank Math Breadcrumbs chuẩn SEO cho Bài Viết & Chuyên Mục
     */
    public function render_rank_math_breadcrumbs() {
        if (is_admin() || is_front_page()) {
            return;
        }

        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (empty($styling)) {
            $styling = get_option('autoweb_subpage_styling', array());
        }

        if (isset($styling['breadcrumbsEnabled']) && $styling['breadcrumbsEnabled'] === false) {
            return;
        }

        if (is_single()) {
            if (isset($styling['breadcrumbsOnPosts']) && $styling['breadcrumbsOnPosts'] === false) {
                return;
            }
        } elseif (is_archive() || is_category() || is_tag() || is_search()) {
            if (isset($styling['breadcrumbsOnCategories']) && $styling['breadcrumbsOnCategories'] === false) {
                return;
            }
        } else {
            return;
        }

        echo $this->get_breadcrumbs_markup();
    }

    /**
     * Xuất breadcrumbs trên các trang tĩnh WordPress (Pages)
     */
    public function render_rank_math_breadcrumbs_page() {
        if (is_admin() || is_front_page() || !is_page()) {
            return;
        }

        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (empty($styling)) {
            $styling = get_option('autoweb_subpage_styling', array());
        }

        if (isset($styling['breadcrumbsEnabled']) && $styling['breadcrumbsEnabled'] === false) {
            return;
        }

        if (empty($styling['breadcrumbsOnPages'])) {
            return;
        }

        echo $this->get_breadcrumbs_markup();
    }

    public function filter_rank_math_breadcrumb_mod($val) {
        $styling = get_option('flatsome_seo_subpage_styling', array());
        if (empty($styling)) {
            $styling = get_option('autoweb_subpage_styling', array());
        }
        if (!isset($styling['breadcrumbsEnabled']) || !empty($styling['breadcrumbsEnabled'])) {
            return 1;
        }
        return $val;
    }

    public function shortcode_autoweb_breadcrumb($atts = array()) {
        return $this->get_breadcrumbs_markup();
    }

    /**
     * Tạo mã HTML Breadcrumbs chuẩn SEO kết hợp Rank Math
     */
    public function get_breadcrumbs_markup() {
        $html = '';

        // 1. Gọi trực tiếp hàm gốc của Rank Math nếu có
        if (function_exists('rank_math_the_breadcrumbs')) {
            ob_start();
            rank_math_the_breadcrumbs();
            $html = ob_get_clean();
        }

        // 2. Nếu hàm chưa xuất HTML, thử qua shortcode chuẩn của Rank Math
        if (empty(trim($html)) && shortcode_exists('rank_math_breadcrumb')) {
            $html = do_shortcode('[rank_math_breadcrumb]');
        }

        // 3. Fallback Yoast SEO nếu site dùng Yoast
        if (empty(trim($html)) && function_exists('yoast_breadcrumb')) {
            ob_start();
            yoast_breadcrumb('<nav class="rank-math-breadcrumb breadcrumbs"><p>', '</p></nav>');
            $html = ob_get_clean();
        }

        // 4. Fallback Flatsome Native Breadcrumb
        if (empty(trim($html)) && function_exists('flatsome_breadcrumb')) {
            ob_start();
            flatsome_breadcrumb('rank-math-breadcrumb');
            $html = ob_get_clean();
        }

        if (empty(trim($html))) {
            return '';
        }

        return "\n<!-- Flatsome AutoTheme Rank Math Breadcrumbs -->\n" .
               '<div class="autoweb-breadcrumbs-wrapper">' . "\n" .
               '  <div class="row">' . "\n" .
               '    <div class="large-12 col">' . "\n" .
               '      <div class="autoweb-breadcrumbs-container">' . "\n" .
               '        ' . $html . "\n" .
               '      </div>' . "\n" .
               '    </div>' . "\n" .
               '  </div>' . "\n" .
               '</div>' . "\n";
    }
}

// Khởi chạy plugin
add_action('plugins_loaded', array('Flatsome_SEO_Bridge', 'get_instance'));

