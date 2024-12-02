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

  has(key: K) {
    return this.map.has(key);
  }

  values() {
    return this.keys.map((key) => this.map.get(key)!);
  }

  get size() {
    return this.map.size;
  }
}
