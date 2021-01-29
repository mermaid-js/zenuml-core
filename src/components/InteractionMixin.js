function isNullOrUndefined(value) {
  return value === null || value === undefined
}

export default {
  computed: {
    message: function () {
      return this.context?.message()
    },
    realFrom: function() {
      return this.func?.from()?.getCode() || this.from
    },
    func: function() {
      return this.message?.func()
    },
    assignee: function () {
      function safeCodeGetter (context) {
        return (context && context.getCode()) || ''
      }
      let assignment = this.message?.assignment()
      if (!assignment) return ''
      let assignee = safeCodeGetter(assignment.assignee())
      const type = safeCodeGetter(assignment.type())
      return assignee + (type ? ':' + type : '')
    },
    signature: function () {
      return this.func?.signature().map(s => s.getCode()).join('.')
    },
    translateX: function() {
      // The starting point is always this.from
      const moveTo = this.rightToLeft ? this.to : this.realFrom
      // -1 for interaction when right to left
      return this.distance(moveTo, this.from) + (this.rightToLeft ? -1 : 0)
    },
    rightToLeft: function () {
      return this.distance(this.to, this.realFrom) < 0
    },
    isCurrent: function () {
      let start = this.func?.start.start
      // it is still considered as the current element if the cursor is just after the end of the function
      let stop = this.func?.stop.stop + 1
      /* eslint-disable */
      console.log(start, stop, this.cursor)
      if (isNullOrUndefined(this.cursor) || isNullOrUndefined(start) || isNullOrUndefined(stop)) return false
      return this.cursor >= start && this.cursor <= stop
    }
  }
}