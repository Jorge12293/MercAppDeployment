<template>
  <div class="app-loader" aria-label="Cargando..." role="status">
    <span class="app-loader__spinner" />
    <span class="app-loader__text">Cargando...</span>
  </div>
</template>

<style scoped>
.app-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 60vh;
  color: var(--color-text-muted);
}

.app-loader__spinner {
  display: block;
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.app-loader__text {
  font-size: 0.9rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
