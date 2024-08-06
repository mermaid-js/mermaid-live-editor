module.exports = {
  plugins: [require('daisyui')],
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in',
        fadeOut: 'fadeOut 1s ease-in'
      }
    }
  },
  variants: {
    extend: {}
  }
};
