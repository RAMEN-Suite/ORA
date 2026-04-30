import { Preset } from '@primeuix/themes/types';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/Aura';

export const SuitePreset: Preset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f2f4f8',
      100: '#d6dce8',
      200: '#b3bfd4',
      300: '#8f9fc1',
      400: '#6b7fad',
      500: '#4a5f8f',
      600: '#37486e',
      700: '#25314d',
      800: '#1b2438',
      900: '#161b2c',
      950: '#0f121d',
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
        ground: {
          background: '{surface.50}',
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
        ground: {
          background: '{surface.950}',
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
  },
});
