import { Preset } from '@primeuix/themes/types';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/Aura';

export const SuitePreset: Preset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{surface.50}',
      100: '{surface.100}',
      200: '{surface.200}',
      300: '{surface.300}',
      400: '{surface.400}',
      500: '{surface.500}',
      600: '{surface.600}',
      700: '{surface.700}',
      800: '{surface.800}',
      900: '{surface.900}',
      950: '{surface.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{surface.950}',
          inverseColor: '{surface.0}',
          hoverColor: '{surface.900}',
          activeColor: '{surface.800}',
        },
        highlight: {
          background: '{surface.950}',
          focusBackground: '{surface.700}',
          color: '{surface.0}',
          focusColor: '{surface.0}',
        },
        ground: {
          background: '{surface.50}',
        },
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
      },
      dark: {
        primary: {
          color: '{surface.0}',
          inverseColor: '{surface.950}',
          hoverColor: '{surface.100}',
          activeColor: '{surface.200}',
        },
        highlight: {
          background: '{surface.950}',
          focusBackground: '{surface.700}',
          color: '{surface.0}',
          focusColor: '{surface.0}',
        },
        ground: {
          background: '{surface.950}',
        },
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
          950: '{neutral.950}',
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
