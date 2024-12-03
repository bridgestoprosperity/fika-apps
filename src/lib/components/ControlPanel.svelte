<script>
    import { onMount } from 'svelte';
    let controlPanelOpen = $state(true);

    function togglePanel() {
        controlPanelOpen = !controlPanelOpen;
    }
</script>

<div class="panel-card px-2 py-2" class:closed={!controlPanelOpen}>
    <div class="hamburger">
        <input class="checkbox" type="checkbox" checked={controlPanelOpen} on:click={togglePanel}/>
        <svg fill="none" viewBox="0 0 50 50" height="50" width="50">
            <path
                class="lineTop line"
                stroke-linecap="round"
                stroke-width="4"
                stroke="black"
                d="M6 11L44 11"></path>
            <path stroke-linecap="round" stroke-width="4" stroke="black" d="M6 24H43" class="lineMid line"
            ></path>
            <path
                stroke-linecap="round"
                stroke-width="4"
                stroke="black"
                d="M6 37H43"
                class="lineBottom line"></path>
        </svg>
    </div>

    <label class="form-control w-full max-w-xs">
        <div class="label">
            <span class="label-text">Visualize on Map</span>
        </div>
        <select class="select bg-stone-100">
            <option>Vector Data</option>
            <option>Raster Data</option>
            <option>Combined</option>
        </select>
    </label>
</div>

<style>
    .panel-card {
        width: 280px;
        height: flex;
        border-radius: 0 10px 10px 0px;
        background: linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 0%, rgba(152, 178, 216, 0.3) 100%);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.08);
        position: relative;
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.3);
        transition: transform 0.3s ease-in-out;
        transform: translateX(0);
    }

    .panel-card.closed {
        transform: translateX(-100%);
    }

    .hamburger {
        height: 50px;
        width: 50px;
        transform: 0.2s;
        position: relative;
    }

    .hamburger .checkbox {
        position: absolute;
        opacity: 0;
        height: 100%;
        width: 100%;
        cursor: pointer;
        z-index: 2;
    }

    .line {
        transition: 0.5s;
        stroke-width: 6px;
        stroke: black;
    }

    .lineTop {
        stroke-dasharray: 40 40;
        stroke-dashoffset: 25;
    }

    .lineBottom {
        stroke-dasharray: 40 40;
        stroke-dashoffset: 60;
    }

    .lineMid {
        stroke-dasharray: 40 40;
    }

    .hamburger .checkbox:checked + svg .line {
        stroke: crimson;
    }

    .hamburger .checkbox:checked + svg .lineTop {
        stroke-dashoffset: 0;
        transform-origin: left;
        transform: rotateZ(45deg) translate(-7px, -5px);
    }

    .hamburger .checkbox:checked + svg .lineMid {
        stroke-dashoffset: 40;
    }

    .hamburger .checkbox:checked + svg .lineBottom {
        stroke-dashoffset: 0;
        transform-origin: left;
        transform: rotateZ(-45deg) translate(-5px, 5px);
    }
</style>