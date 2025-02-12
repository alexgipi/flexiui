// src/TagsInput.js
class TagsInput {
    constructor(element) {
      this.element = element;
      this.tags = [];
      this.render();
    }
  
    addTag(tag) {
      if (tag && !this.tags.includes(tag)) {
        this.tags.push(tag);
        this.update();
      }
    }
  
    removeTag(tag) {
      this.tags = this.tags.filter(t => t !== tag);
      this.update();
    }
  
    update() {
      this.element.innerHTML = '';
      this.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = tag;
        tagElement.classList.add('tag');
        tagElement.addEventListener('click', () => this.removeTag(tag));
        this.element.appendChild(tagElement);
      });
      const input = document.createElement('input');
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.addTag(e.target.value);
          e.target.value = '';
        }
      });
      this.element.appendChild(input);
    }
  
    render() {
      this.element.classList.add('tags-input');
      this.update();
    }
  }
  
  export default TagsInput;
  