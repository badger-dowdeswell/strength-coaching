/** @type {import('tailwindcss').Config} */
export default {
   content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      // Placing the custom colour specification inside
      // the extend section preserves all the default
      // theme colours.
      extend: {
         colors: {
            "twitter-blue": "#1DA1F2",
         },
      },
   },
   plugins: [],
}
