# Makoto - Portfolio Website

![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Strapi](https://img.shields.io/badge/Strapi-2E7EEA?style=for-the-badge&logo=strapi&logoColor=white)
![TresJS](https://img.shields.io/badge/TresJS-82DBC5?style=for-the-badge&logo=three.js&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-00DC82?style=for-the-badge&logo=gsap&logoColor=white)

## 📖 About the project

This is the repository for the modern website "Makoto," created as a portfolio for a developer and graphic designer. The project was built using the latest web technologies, with a focus on performance, interactivity, and aesthetics. The site uses **Nuxt** for server-side rendering (SSR), which ensures excellent SEO and fast loading speeds. Integration with **TresJS** allows for the implementation of advanced 3D graphics, and **Strapi** as a headless CMS facilitates content management.

### ✨ Key Features

* **🚀 Modern Stack:** Built on Nuxt 4, Vue 3, Vite, and Tailwind CSS.
* **🎨 3D Graphics:** Interactive 3D elements thanks to integration with TresJS.
* **🌍 Multilingual:** Support for English and Polish languages with the `@nuxtjs/i18n` module.
* **📝 Content Management:** Integrated with the headless CMS Strapi (`@nuxtjs/strapi`).
* **📱 Fully Responsive:** Modern design with UI components from `@nuxt/ui` and typography from `@tailwindcss/typography`.
* **⚡ Optimization:** Optimized image (`@nuxt/image`) and font (`@nuxtjs/google-fonts`) loading.
* **🎬 Animations:** Smooth animations using the GSAP library.

## 🛠️ Tech Stack

The project uses a wide range of modern tools and libraries:

| Category | Technology |
| :--- | :--- |
| **Framework** | Nuxt, Vue.js |
| **Styling** | Tailwind CSS, PostCSS, `@nuxt/ui` |
| **3D Graphics** | TresJS, Three.js |
| **CMS** | Strapi |
| **Multilingual** | `@nuxtjs/i18n` |
| **Animations** | GSAP, `@tsparticles/vue3` |
| **Other** | `@nuxt/image`, `@nuxtjs/google-fonts`, `sharp`, `markdown-it` |

## 🚀 Getting Started

To run the project locally, follow the steps below.

### Prerequisites

Make sure you have the following software installed:
* [Node.js](https://nodejs.org/en/) (LTS version recommended)
* [pnpm](https://pnpm.io/installation)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-URL>
    cd makoto-website
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Configure environment variables. Create a `.env` file in the project's root directory and add the necessary keys:
    ```env
    NUXT_PUBLIC_API_URL=http://your-strapi-api-address.com
    STRAPI_TOKEN=your_strapi_api_token
    ```

### Usage

1.  **Development Server**
    Start the development server with hot-reloading at `http://localhost:3000`:
    ```bash
    pnpm dev
    ```

2.  **Production Build**
    To build the application for production:
    ```bash
    pnpm build
    ```

3.  **Preview Production Build**
    To locally test the built application:
    ```bash
    pnpm preview
    ```

## 📂 Project Structure

The most important directories in the project:
```
/
├── app/
│   ├── assets/         # Uncompiled assets
│   ├── components/     # Vue components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Pages and routing
│   └── plugins/        # Nuxt plugins
├── i18n/
│   └── lang/           # Translation files
├── public/             # Static public files
├── server/
│   └── api/            # Server API endpoints
├── nuxt.config.ts      # Main Nuxt config file
└── package.json        # Project dependencies and 
```