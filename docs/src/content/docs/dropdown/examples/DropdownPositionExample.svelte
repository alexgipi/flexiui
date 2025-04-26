<script lang="ts">
    import { Dropdown, DropdownItem } from "@flexiui/svelte-dropdown";
    import Button from "@components/ui/Button.svelte";
  
    let recalculateDropdownPosition: any = null;
  
    function handleOpenDropdown(e: any) {
      console.log(e);
    }
  
    function handleCloseDropdown(e: any) {
      console.log(e);
    }
  
    function dropdownItemClickHandler(e: any) {
      console.log(e.detail);
    }
  
    let activePosition:
      | "top-left"
      | "top-center"
      | "top-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right"
      | "left-top"
      | "left-center"
      | "left-bottom"
      | "right-top"
      | "right-center"
      | "right-bottom" = "top-right";
  
    const positions = [
      ["top-left", "top-center", "top-right"],
      ["bottom-left", "bottom-center", "bottom-right"],
      ["left-top", "left-center", "left-bottom"],
      ["right-top", "right-center", "right-bottom"],
    ];
  
    function changeDropdownPosition(position: any) {
      activePosition = position;
    }
  </script>
  
  <div class="btn-groups">
    {#each positions as positionsRow}
      <div class="btn-group">
        {#each positionsRow as position }
          <Button variant="contained"
          data-dropdown-toggle="dropdown"
          data-dropdwon-trigger="click"
          data-dropdown-key={position}
          on:click={() => changeDropdownPosition(position)}>
          {position.replaceAll('-', ' ')}
          </Button>
        {/each}        
      </div>
    {/each}
  </div>
  
  <Dropdown
    bind:calculatePosition={recalculateDropdownPosition}
    position={activePosition}
    yOffset={0}
    xOffset={0}
    margin={8}
    id="dropdown"
    on:close={handleCloseDropdown}
    on:open={handleOpenDropdown}
  >
    <DropdownItem on:clicked={dropdownItemClickHandler}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        viewBox="0 -960 960 960"
        width="16"
        fill="currentColor"
        ><path
          d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z"
        /></svg
      >
      Profile
    </DropdownItem>
    <DropdownItem on:clicked={dropdownItemClickHandler}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        viewBox="0 -960 960 960"
        width="16"
        fill="currentColor"
        ><path
          d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z"
        /></svg
      >
      Settings
    </DropdownItem>
    <DropdownItem on:clicked={dropdownItemClickHandler}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        viewBox="0 -960 960 960"
        width="16"
        fill="currentColor"
        ><path
          d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z"
        /></svg
      >
      Language
    </DropdownItem>
  </Dropdown>
  
  <style>
    .btn-groups {
      flex-direction: column;
      align-items: flex-start;
    }
  
    .btn-groups,
    .btn-group {
      display: flex;
      gap: 10px;
    }
  </style>
  