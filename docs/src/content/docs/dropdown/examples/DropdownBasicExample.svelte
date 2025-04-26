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

</script>

<Button
variant="contained"
data-dropdown-toggle="dropdown"
data-dropdwon-trigger="click"
data-dropdown-key={"example-dropdown"}
>
  Example dropdown
</Button>

<Dropdown
  bind:calculatePosition={recalculateDropdownPosition}
  position={'top-left'}
  yOffset={0}
  xOffset={0}
  margin={8}
  id="dropdown"
  on:close={handleCloseDropdown}
  on:open={handleOpenDropdown}
>
  <DropdownItem on:clicked={dropdownItemClickHandler}>
    My profile
  </DropdownItem>
  <DropdownItem on:clicked={dropdownItemClickHandler}>
    Account settings
  </DropdownItem>
  <DropdownItem on:clicked={dropdownItemClickHandler}>
    Language
  </DropdownItem>
</Dropdown>