<template>
  <header class="flex items-center gap-4 surface">
    <RouterLink :to="{ name: 'Home' }">
      <h1>Clashing Destinies</h1>
    </RouterLink>
    <nav class="ml-auto">
      <ul class="flex gap-4">
        <li>
          <RouterLink :to="{ name: 'Login' }">Login</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Register' }">Register</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped lang="postcss">
h1 {
  font-family: 'Cinzel Decorative', serif;
  font-weight: var(--font-weight-7);
  padding-left: var(--size-6);
  color: transparent;
  background-image: linear-gradient(#efef9f, #efef9f 50%, #d7ad42 50%);
  background-clip: text;
  text-shadow: 3px 5px 10px hsl(from cyan h s l / 0.3);
}
li {
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
  display: grid;
  > a {
    padding: var(--size-3);
  }
}

li:hover {
  background: hsl(40 60% 60% / 0.15);
}
</style>
