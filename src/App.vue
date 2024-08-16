<template>
  <div>
    <event-calendar />
  </div>
</template>

<script>
import EventCalendar from './components/EventCalendar.vue';

export default {
  name: 'App',
  components: {
    EventCalendar,
  },
};
</script>

<style>
/* Global styles */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
</style>
