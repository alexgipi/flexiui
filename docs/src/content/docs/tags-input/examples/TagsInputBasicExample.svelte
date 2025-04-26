<script>
    import { TagsInput } from "@flexiui/svelte-tags-input";

    let labels = {
        plural: "Tags",
        singular: "Tag",
    };

    let tags = ["Banana", "Apple", "Mango", "Grape", "Orange", 
    "Pineapple", "Strawberry", "Blueberry", "Watermelon"];

</script>

<TagsInput
  name="tags-input-basic-example"
  {labels}
  {tags}
  min={1}
  max={20}
  showCounter={true}
  allowDuplicates={false}
  bidimensional={false}
  bidimensionalSeparator="->"
  placeholder={"Press enter to add a new tag"}
  required={false}
/>
