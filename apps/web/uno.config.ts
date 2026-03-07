import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives,
} from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  theme: {
    colors: {
      primary: '#1677ff',
    },
    borderRadius: {
      lg: '8px',
    },
  },
  safelist: ['flex', 'items-center', 'justify-between', 'p-4'],
});
