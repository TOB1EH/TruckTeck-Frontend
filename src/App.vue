<script setup></script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* Full-app background using image placed in public/bg-cargo.jpg */
:root { --overlay: rgba(2,8,16,0.72); }

#app {
  min-height: 100vh;
  display: block;
  background-image: url('/bg-cargo.jpg');
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  color-scheme: dark;
}

/* subtle dark overlay to improve contrast with text/components */
#app::before {
  content: '';
  position: fixed;
  inset: 0;
  background: var(--overlay);
  /* add subtle blur to further dim and soften the image beneath */
  pointer-events: none;
  z-index: 0;
}

/* semi-transparent blue tint above the dark blurred overlay to give a cool, dimmed look */
#app::after {
  content: '';
  position: fixed;
  inset: 0;
  /* stronger blue tint to darken the image while keeping the cool tone */
  background: linear-gradient(rgba(6,30,70,0.48), rgba(6,26,60,0.56));
  pointer-events: none;
  z-index: 0; /* sits above the dark blur but below content */
}

/* Keep scoped UI elements above the overlay */
.v-application, .v-main, #app > * {
  position: relative;
  z-index: 1;
}

/* Ensure body background behind fixed image is dark as fallback */
body {
  background-color: #041226;
}
</style>
