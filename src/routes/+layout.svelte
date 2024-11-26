<script>
    import '../app.css';
    let { children } = $props();
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
    import Header from './Header.svelte';
    injectAnalytics();
</script>

<div class="app">
    <Header />

    <main>
        {@render children()}
    </main>

    <footer></footer>
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
</style>