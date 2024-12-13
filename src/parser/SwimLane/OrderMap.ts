export class OrderedMap<K, V> {
  private map = new Map<K, V>();
  private keys: K[] = [];

  set(key: K, value: V) {
    if (!this.map.has(key)) {
      this.keys.push(key);
    }
    this.map.set(key, value);
    return this;
  }

  unshift(key: K, value: V) {
    this.keys.unshift(key);
    this.map.set(key, value);
    return this;
  }

  shift() {
    const key = this.keys.shift();
    if (!key) {
      throw new Error("No key");
    }
    this.map.delete(key);
    return key;
  }

  push(key: K, value: V) {
    this.keys.push(key);
    this.map.set(key, value);
    return this;
  }

  pop() {
    const key = this.keys.pop();
    if (!key) {
      throw new Error("No key");
    }
    this.map.delete(key);
    return key;
  }

  get(key: K) {
    return this.map.get(key);
  }

  getByIndex(index: number) {
    return this.map.get(this.keys[index]);
  }

  setByIndex(index: number, key: K, value: V) {
    const oldKey = this.keys[index];
    this.map.set(key, value);
    this.keys[index] = key;
    this.map.delete(oldKey);
  }

  has(key: K) {
    return this.map.has(key);
  }

  values() {
    return this.keys.map((key) => this.map.get(key)!);
  }

  delete(key: K) {
    this.map.delete(key);
    this.keys = this.keys.filter((k) => k !== key);
  }

  get size() {
    return this.map.size;
  }
}
