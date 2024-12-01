A.method() {
  if (value > 0) {
    B.method()
    C.method()
  } else {
    C.method()
  }

  par {
    A.method()
    B.method()
  }


  while (value > 0) {
    C.method()
  }
}
