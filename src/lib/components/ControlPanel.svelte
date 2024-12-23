<script>
    import { onMount } from 'svelte';
    import { AnglesLeftSolid } from 'svelte-awesome-icons';
    import { waternetMapState } from '$lib/utils/state.svelte';

    function togglePanel() {
        waternetMapState.visibility.controlPanelOpen = !waternetMapState.visibility.controlPanelOpen;
    }
    console.log(waternetMapState.visibility.controlPanelOpen)
</script>

<div class="panel-container shadow-lg" class:closed={!waternetMapState.visibility.controlPanelOpen}>
    <div class="panel-card px-2 py-2" class:closed={!waternetMapState.visibility.controlPanelOpen}>
        <slot></slot>
    </div>
    <!-- <button
        onclick={togglePanel}
        class="toggle-button"
        aria-label="Toggle Panel"
        class:closed={!controlPanelOpen}>
        <div class="icon-wrapper" class:rotated={!controlPanelOpen}>
            <AnglesLeftSolid />
        </div>
    </button> -->
</div>

<style>
    .panel-container {
        transition: transform 0.3s ease-in-out;
        transform: translateX(0);
    }
    .panel-card {
        width: 280px;
        height: flex;
        border-radius: 0px 10px 10px 0px;
        background-color: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(5px);
        position: relative;
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.3);
        transition: transform 0.3s ease-in-out;
        transform: translateX(0);
    }
    .panel-container.closed {
        transform: translateX(calc(-280px));
    }

    /* .toggle-button {
        position: absolute;
        right: -39px;
        top: calc(50% - 40px);
        width: 40px;
        height: 80px;
        background-color: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(5px);
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-left: none;
        border-radius: 0 8px 8px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.3s ease-in-out;
    } */
    /* .icon-wrapper {
        transition: transform 0.3s ease-in-out;
    }
    .icon-wrapper.rotated {
        transform: rotate(180deg);
    }
    .toggle-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
    .toggle-button:hover:active {
        background-color: rgba(255, 255, 255, 0.15);
    } */
</style>