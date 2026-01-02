# AbsAdmin Admin Panel

A modern admin panel built with Vue 3 + Ant Design Vue + TypeScript.

## Tech Stack

- **Vue 3.5** - Progressive JavaScript Framework
- **TypeScript** - Type Safety
- **Vite 6** - Build Tool
- **Ant Design Vue 4.x** - Enterprise UI Components
- **Vue Router 4.x** - Official Router
- **Vue I18n** - Internationalization
- **Axios** - HTTP Client
- **Tailwind CSS 3.x** - Utility-first CSS Framework
- **Less** - CSS Preprocessor

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/              # API interfaces
├── assets/           # Static assets
├── components/       # Shared components
│   ├── AdminLayout.vue    # Main layout with sidebar
│   └── widgets/           # Reusable widgets
│       ├── ImageUpload.vue   # Image upload component
│       ├── CsvExport.vue     # CSV export component
│       └── CsvImport.vue     # CSV import component
├── locales/          # Internationalization
├── router/           # Router configuration
├── utils/            # Utility functions
├── views/            # Page views
│   ├── home/             # Home page
│   ├── setting/          # Settings pages
│   ├── user/             # Login page
│   └── exception/        # Error pages
└── main.ts           # Entry file
```

## Adding New Modules

To add a new module (e.g., Order Management), you only need to modify **2 places**:

### 1. Add Route in `src/router/index.ts`

```typescript
{
  path: '/order/list',
  name: 'order_list',
  component: () => import('@/views/order/List.vue')
}
```

### 2. Add Menu in `src/components/AdminLayout.vue`

```vue
<!-- Top-level menu -->
<a-menu-item key="/order/list" @click="$router.push('/order/list')">
  <template #icon><ShoppingOutlined /></template>
  {{ $t('menu.orderManagement') }}
</a-menu-item>

<!-- OR Sub-menu -->
<a-sub-menu key="/order">
  <template #icon><ShoppingOutlined /></template>
  <template #title>{{ $t('menu.order') }}</template>
  <a-menu-item key="/order/list" @click="$router.push('/order/list')">
    {{ $t('menu.orderList') }}
  </a-menu-item>
</a-sub-menu>
```
