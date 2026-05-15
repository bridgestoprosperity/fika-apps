<script>
	import { UserButton } from 'svelte-clerk';

	let { data } = $props();
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-6">
	<h1 class="text-3xl font-bold text-secondary">Clerk Auth Test</h1>
	<p class="text-base-content">You are signed in. User ID: <code>{data.userId}</code></p>
	<UserButton />
</div>
