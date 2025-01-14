<script>
    let { colors, name, showScale = false, scale } = $props();
  
    // Optional: Format scale values for display
    function formatValue(value) {
      return typeof value === 'number' ? value.toFixed(1) : value;
    }
  </script>
  
  <div class="flex flex-col gap-1">
    <div 
      class="h-4 w-full rounded-sm" 
      style="background: linear-gradient(to right, {colors.join(', ')})"
    />
    
    {#if showScale && scale}
      <div class="flex justify-between text-xs">
        <span>{formatValue(scale.min)}</span>
        <span>{formatValue(scale.max)}</span>
      </div>
    {/if}
  </div>