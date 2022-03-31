<template>
  <div class="loading">
    <div class="loader"></div>
  </div>
</template>

<script>
export default {
  name: "Loader",
};
</script>
<style scoped>
.loading {
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  z-index: 9999999999;
  overflow: hidden;
  background: #fff;
  opacity: 0.5;
}
.loader {
  font-size: 10px;
  border-top: 0.8em solid rgba(218, 219, 223, 1);
  border-right: 0.8em solid rgba(218, 219, 223, 1);
  border-bottom: 0.8em solid rgba(218, 219, 223, 1);
  border-left: 0.8em solid rgba(58, 166, 165, 1);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
}
.loader,
.loader:after {
  border-radius: 50%;
  width: 6em;
  height: 6em;
  display: block;
  position: absolute;
  top: 48%;
  left: 48%;
  margin-top: -4.05em;
}
</style>
