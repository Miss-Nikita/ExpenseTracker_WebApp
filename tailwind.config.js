// // /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/*.{html,js,css}", "./views/*.ejs"],

//   theme: {
//     extend: {},
//   },
//   plugins: [
//     {
//       tailwindcss: {},
//       autoprefixer: {},
//   },

//   ],
// }

module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './views/**/*.ejs'
  ],
  theme: {
    extend: {  backgroundImage: {
      'custom-gradient': 'linear-gradient(90deg, rgba(30,31,32,1) 0%, rgba(94,159,147,1) 24%, rgba(29,43,41,1) 40%, rgba(30,31,32,1) 60%, rgba(30,31,32,1) 100%)',
    },},
  },
  plugins: [],
};


