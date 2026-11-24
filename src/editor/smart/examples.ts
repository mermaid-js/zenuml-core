/** Three generic sample diagrams for the "Examples" picker. */
export interface Example {
  name: string;
  doc: string;
}

export const EXAMPLES: readonly Example[] = [
  {
    name: "Order a coffee",
    doc: `Customer->Barista: order a latte
Barista.makeCoffee()
Barista->Customer: here is your latte
`,
  },
  {
    name: "Log in with a check",
    doc: `User.login(name, password)
Server.checkPassword() {
  return valid
}
if (valid) {
  Server->User: welcome
} else {
  Server->User: wrong password
}
`,
  },
  {
    name: "Upload with a retry",
    doc: `App.upload(file)
try {
  Storage.save(file)
} catch {
  App.showError()
}
loop (not done) {
  App.checkProgress()
}
`,
  },
];
