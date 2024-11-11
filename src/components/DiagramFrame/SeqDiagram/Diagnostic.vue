<template>
  <div class="relative group inline-block">
    <!-- Diagnostic trigger with default slot -->
    <span class="italic px-2 py-0.5 rounded cursor-help" :class="severityClass">
      <slot>{{ message }}</slot>
    </span>

    <!-- Diagnostic tooltip content -->
    <div
      class="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50"
    >
      <slot name="tooltip">
        {{ message }}
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "Diagnostic",
  props: {
    // Optional default message if no slot content provided
    message: {
      type: String,
      default: "",
    },
    // Severity level: 'error' | 'warning' | 'info'
    severity: {
      type: String,
      default: "info",
    },
  },
  computed: {
    severityClass() {
      switch (this.severity) {
        case "error":
          return "text-red-500 bg-red-50";
        case "warning":
          return "text-yellow-600 bg-yellow-50";
        default:
          return "text-gray-500 bg-gray-50";
      }
    },
  },
};
</script>
