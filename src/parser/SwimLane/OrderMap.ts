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
