export class ArrayList<T> {
  private elements: T[];
  private size: number;
  private static readonly DEFAULT_CAPACITY = 10;

  constructor(initialCapacity: number = ArrayList.DEFAULT_CAPACITY) {
    if (initialCapacity < 0) {
      throw new Error("Illegal Capacity: " + initialCapacity);
    }
    this.elements = new Array<T>(initialCapacity);
    this.size = 0;
  }

  // Add element to end of list
  add(element: T): boolean {
    this.ensureCapacity(this.size + 1);
    this.elements[this.size++] = element;
    return true;
  }

  // Add element at specific index
  addAt(index: number, element: T): void {
    this.rangeCheckForAdd(index);
    this.ensureCapacity(this.size + 1);

    // Shift elements right to make space
    for (let i = this.size; i > index; i--) {
      this.elements[i] = this.elements[i - 1];
    }

    this.elements[index] = element;
    this.size++;
  }

  // Remove element at index
  removeAt(index: number): T {
    this.rangeCheck(index);

    const oldValue = this.elements[index];

    // Shift elements left to fill gap
    for (let i = index; i < this.size - 1; i++) {
      this.elements[i] = this.elements[i + 1];
    }

    this.elements[--this.size] = undefined as any;
    return oldValue;
  }

  // Remove first occurrence of element
  remove(element: T): boolean {
    const index = this.indexOf(element);
    if (index >= 0) {
      this.removeAt(index);
      return true;
    }
    return false;
  }

  // Get element at index
  get(index: number): T {
    this.rangeCheck(index);
    return this.elements[index];
  }

  // Set element at index
  set(index: number, element: T): T {
    this.rangeCheck(index);
    const oldValue = this.elements[index];
    this.elements[index] = element;
    return oldValue;
  }

  // Check if list contains element
  contains(element: T): boolean {
    return this.indexOf(element) >= 0;
  }

  // Get index of first occurrence of element
  indexOf(element: T): number {
    for (let i = 0; i < this.size; i++) {
      if (element === this.elements[i]) {
        return i;
      }
    }
    return -1;
  }

  // Clear the list
  clear(): void {
    for (let i = 0; i < this.size; i++) {
      this.elements[i] = undefined as any;
    }
    this.size = 0;
  }

  // Check if list is empty
  isEmpty(): boolean {
    return this.size === 0;
  }

  // Get current size
  getSize(): number {
    return this.size;
  }

  // Convert to array
  toArray(): T[] {
    return this.elements.slice(0, this.size);
  }

  // Ensure capacity is sufficient
  private ensureCapacity(minCapacity: number): void {
    if (minCapacity > this.elements.length) {
      const oldCapacity = this.elements.length;
      const newCapacity = oldCapacity + (oldCapacity >> 1); // Grow by 50%
      const newElements = new Array(Math.max(newCapacity, minCapacity));

      // Copy existing elements
      for (let i = 0; i < this.size; i++) {
        newElements[i] = this.elements[i];
      }

      this.elements = newElements;
    }
  }

  // Check if index is valid for existing elements
  private rangeCheck(index: number): void {
    if (index < 0 || index >= this.size) {
      throw new Error("Index: " + index + ", Size: " + this.size);
    }
  }

  // Check if index is valid for adding elements
  private rangeCheckForAdd(index: number): void {
    if (index < 0 || index > this.size) {
      throw new Error("Index: " + index + ", Size: " + this.size);
    }
  }
}
