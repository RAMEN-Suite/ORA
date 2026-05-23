import { definePreset } from '@primeuix/themes';
import type { Preset } from '@primeuix/themes/types';
import Aura from '@primeuix/themes/aura';

export const SuitePreset: Preset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fbf3f5',
      100: '#f4dce2',
      200: '#e9b8c4',
      300: '#d98aa0',
      400: '#c55a76',
      500: '#a93c58',
      600: '#8b3044',
      700: '#712639',
      800: '#5f2233',
      900: '#511f2d',
      950: '#2f0d18',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
        primary: {
          color: '{primary.900}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.950}',
        },
        highlight: {
          background: '{primary.900}',
          focusBackground: '{primary.800}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
      dark: {
        surface: {
          0: '#f6f2ec',
          50: '{neutral.50}',
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}',
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}',
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '#0f121d',
        },
        primary: {
          color: '{primary.100}',
          inverseColor: '{primary.950}',
          hoverColor: '{primary.50}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: '{primary.800}',
          focusBackground: '{primary.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
    },
  },
  components: {
    fieldset: {
      legend: {
        background: 'transparent',
        fontWeight: '300',
      },
    },
    menubar: {
      root: {
        background: '{primary.900}',
        borderColor: '{primary.950}',
        color: '{primary.50}',
        borderRadius: '0',
        gap: '0.5rem',
      },
      item: {
        color: '{primary.50}',
        focusColor: '{primary.50}',
        activeColor: '{primary.50}',
        focusBackground: '{primary.700}',
        activeBackground: '{primary.950}',
        borderRadius: '{border.radius.sm}',
        padding: '0.625rem 0.875rem',
        gap: '0.5rem',
        icon: {
          color: '{primary.100}',
          focusColor: '{primary.50}',
          activeColor: '{primary.50}',
        },
      },
      submenu: {
        background: '{primary.900}',
        borderColor: '{primary.700}',
        borderRadius: '{border.radius.sm}',
        padding: '0.75rem',
        gap: '0.25rem',
        shadow: '0 12px 32px rgba(15, 18, 29, 0.18)',
        icon: {
          color: '{primary.100}',
          focusColor: '{primary.50}',
          activeColor: '{primary.50}',
          size: '0.875rem',
        },
      },
      separator: {
        borderColor: '{primary.700}',
      },
      mobileButton: {
        color: '{primary.50}',
        hoverColor: '{primary.50}',
        hoverBackground: '{primary.700}',
        borderRadius: '{border.radius.sm}',
        size: '2.25rem',
        focusRing: {
          width: '1px',
          style: 'solid',
          color: '{primary.200}',
          offset: '2px',
          shadow: 'none',
        },
      },
    },
  },
});
