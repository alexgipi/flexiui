<script>
  import Tabs from '@components/ui/Tabs/Tabs.svelte';
  import TabPanel from '@components/ui/Tabs/TabPanel.svelte';

  let activeTabIndex = 0;
  let tabs = [
    {
      name: "exercise_content",
      label: "Contenido del ejercicio",
    },
    {
      name: "exercise_settings",
      label: "Ajustes del ejercicio",
    },
  ];
</script>

<Tabs {tabs} bind:activeTabIndex>
  <TabPanel active={activeTabIndex === 0}>
    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sapiente perferendis quod incidunt ullam necessitatibus rerum sunt fugiat et consequatur in at similique molestias nesciunt dolores, impedit modi aliquid! Fuga, vero?
  </TabPanel>
  <TabPanel active={activeTabIndex === 1}>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit illo quisquam aspernatur voluptatem laborum itaque dolores nemo culpa aliquid. Ipsum at dolorum a nulla nemo fugiat enim repudiandae ut quae!
  </TabPanel>
</Tabs>