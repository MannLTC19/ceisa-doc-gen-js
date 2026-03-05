/**
 * antdTheme.js - Ant Design Theme untuk Bea Cukai IKC PSI
 * Dark Futuristic Theme dengan standar Bea Cukai
 */

export const beaCukaiTheme = {
  token: {
    // Colors - Bea Cukai with Dark Futuristic Twist
    colorPrimary: '#1A428B',        // Biru Bea Cukai (Primary)
    colorSuccess: '#22C55E',        // Hijau (Success)
    colorWarning: '#F59E0B',        // Amber (Warning)
    colorError: '#EF4444',          // Merah (Error)
    colorInfo: '#06B6D4',           // Cyan (Info)
    
    // Dark Mode Colors
    colorTextBase: '#E5E7EB',       // Light Gray Text
    colorBgBase: '#0F172A',         // Very Dark Background
    colorBgContainer: '#111827',    // Dark Container
    colorBgLayout: '#030712',       // Darkest Background
    colorBgElevated: '#1F2937',     // Elevated Surface
    colorBorder: '#374151',         // Dark Border
    colorBgBlur: 'rgba(15, 23, 42, 0.7)',
    
    // Neutral Colors (Dark Theme)
    colorTextSecondary: '#9CA3AF',  // Muted Text
    colorTextTertiary: '#6B7280',   // Very Muted
    colorTextQuaternary: '#4B5563', // Lightest Non-text
    
    // Typography
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                 sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 36,
    fontSizeHeading2: 32,
    fontSizeHeading3: 28,
    fontSizeHeading4: 24,
    fontSizeHeading5: 20,
    fontWeightStrong: 700,

    // Border & Radius (Futuristic)
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    lineHeight: 1.5715,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.35,

    // Spacing
    margin: 16,
    marginXS: 8,
    marginSM: 12,
    marginMD: 16,
    marginLG: 24,
    marginXL: 32,
    padding: 16,
    paddingXS: 8,
    paddingSM: 12,
    paddingMD: 16,
    paddingLG: 24,
    paddingXL: 32,

    // Sizing
    controlHeight: 44,
    controlHeightLG: 52,
    controlHeightSM: 36,

    // Shadows (Glowing effect)
    boxShadow: '0 0 20px rgba(26, 66, 139, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)',
    boxShadowSecondary: '0 0 10px rgba(26, 66, 139, 0.08), 0 2px 6px rgba(0, 0, 0, 0.3)',

    // Motion (Smooth, Cinematic)
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    motionEaseIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    motionEaseInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
    motionEaseOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    motionUnit: 0.1,
  },

  components: {
    // Button - Futuristic Style
    Button: {
      controlHeight: 44,
      borderRadius: 8,
      primaryColor: '#1A428B',
      fontWeight: 600,
      colorPrimaryBg: 'rgba(26, 66, 139, 0.15)',
      colorPrimaryBgHover: 'rgba(26, 66, 139, 0.25)',
      controlOutline: 'rgba(26, 66, 139, 0.2)',
    },

    // Input - Dark Themed
    Input: {
      controlHeight: 44,
      fontSize: 14,
      borderRadius: 8,
      colorBgContainer: '#1F2937',
      colorBorder: '#374151',
      colorTextPlaceholder: '#6B7280',
      controlOutline: 'rgba(26, 66, 139, 0.2)',
      colorPrimaryBorder: '#1A428B',
    },

    // Select - Dark
    Select: {
      controlHeight: 44,
      fontSize: 14,
      borderRadius: 8,
      colorBgContainer: '#1F2937',
      colorBorder: '#374151',
    },

    // Card - Dark Futuristic
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 0 20px rgba(26, 66, 139, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)',
      padding: 24,
      paddingLG: 24,
      paddingMD: 16,
      paddingSM: 12,
      colorBgContainer: '#1F2937',
      colorBorder: 'rgba(26, 66, 139, 0.2)',
    },

    // Layout - Dark
    Layout: {
      headerBg: '#111827',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColor: '#E5E7EB',
      footerBg: '#111827',
      footerPadding: '24px 50px',
      siderBg: '#0F172A',
      colorBgBody: '#0F172A',
    },

    // Table - Dark
    Table: {
      headerBg: '#1F2937',
      headerColor: '#E5E7EB',
      borderColor: '#374151',
      headerBorderRadius: 0,
      colorBgContainer: '#111827',
      rowHoverBg: 'rgba(26, 66, 139, 0.1)',
    },

    // Modal - Futuristic
    Modal: {
      borderRadiusLG: 12,
      boxShadow: '0 0 40px rgba(26, 66, 139, 0.3), 0 10px 30px rgba(0, 0, 0, 0.6)',
      colorBgMask: 'rgba(0, 0, 0, 0.85)',
      contentBg: '#111827',
    },

    // Tabs - Dark
    Tabs: {
      borderRadius: 8,
      titleFontSize: 14,
      titleFontSizeActive: 14,
      colorBgContainer: '#1F2937',
      colorBorder: '#374151',
    },

    // Alert - Enhanced
    Alert: {
      borderRadius: 8,
      paddingContentVertical: 12,
      colorInfoBg: 'rgba(26, 66, 139, 0.1)',
      colorInfoBorder: 'rgba(26, 66, 139, 0.3)',
    },

    // Badge - Glowing
    Badge: {
      borderRadius: 4,
      colorBg: 'rgba(26, 66, 139, 0.2)',
      colorText: '#06B6D4',
    },

    // Divider - Subtle
    Divider: {
      marginLG: 24,
      marginSM: 12,
      borderColor: 'rgba(255, 255, 255, 0.06)',
    },

    // Form
    Form: {
      labelColor: '#1F2937',
      labelFontSize: 14,
      labelHeight: 32,
      labelFontWeight: 500,
    },

    // Collapse
    Collapse: {
      borderRadius: 6,
    },

    // Rate
    Rate: {
      starSize: 24,
    },
  },
};

export default beaCukaiTheme;
