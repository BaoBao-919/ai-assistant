<template>
  <div id="app">
    <ChatBox />
  </div>
</template>

<script setup lang="ts">
import ChatBox from './components/ChatBox.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
</style>