import TagsInput from '../src/TagsInput.js';

const tagsInputElement = document.getElementById('tags-input');
const config = {
    placeholder: 'Add a tag',
    tags: [],
    min: 1,
    max: 5,
    separator: null,
    allowDuplicates: false,
    bidimensional: false,
    bidimensionalSeparator: null,
    lang: 'en',
    placeholder: 'Add a tag',
    required: false,
}
const tagsInput = new TagsInput(tagsInputElement, config);