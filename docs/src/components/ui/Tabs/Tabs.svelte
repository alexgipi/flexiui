<script lang="ts">
    export let field = null;
    export let name = null;
    export let activeTab = 0;
    export let tabs:any = [];
  
    function handleTabClick(index: number) {
      activeTab = index;
    }
  </script>
  
  <div class="tabs-field">
    <div class="tabs">
      {#each tabs as tab, index (tab.name)}
        <button
          type="button"
          class:active={activeTab === index}
          on:click={(e) => {
            handleTabClick(index);
          }}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  
    <!-- Slot para el contenido de la pestaña activa -->
    <div class="tabs-content">
      <slot />
    </div>
  </div>
  
  <style>
    .tabs-field {
      margin-top: 0.5rem;
      width: 100%;
    }
  
    .tabs {
        display: inline-flex;
        gap: 12px;
        padding: 8px;
        border-radius: 14px;
        margin-bottom: 1rem;
        background: #1b1b1b;
    }
  
    .tabs button {
        padding: 9px 20px;
        border: none;
        background: transparent;
        border-radius: 9px;
        font-size: 0.94rem;
        color: #ffffffc4;
        cursor: pointer;
        outline: none;
    }
  
    .tabs button.active {
        background: #080808;
        color: #fff;
    }
  
  </style>
  