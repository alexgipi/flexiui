<script>
  import Accordion from "@components/ui/Accordion/Accordion.svelte";
  import AccordionItem from "@components/ui/Accordion/AccordionItem.svelte";
  import AccordionSummary from "@components/ui/Accordion/AccordionSummary.svelte";
  import AccordionContent from "@components/ui/Accordion/AccordionContent.svelte";
</script>

<Accordion>
  <AccordionItem>
    <AccordionSummary slot="summary">Is it accessible?</AccordionSummary>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem>
    <AccordionSummary slot="summary">Is it styled?</AccordionSummary>
    <AccordionContent>
      Yes. It comes with default styles that matches the other components'
      aesthetic.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem>
    <AccordionSummary slot="summary">Is it animated?</AccordionSummary>
    <AccordionContent>
      Yes! You can animate the Accordion with CSS or JavaScript.
    </AccordionContent>
  </AccordionItem>
</Accordion>
