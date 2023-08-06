import Comment from '../Comment/Comment';

describe('Comment', function () {
  test.each([
    ['[red] comment1 \n', ' comment1', {color: 'red'}],
    ['[red] comment \n multiple-line\n', ' comment \n multiple-line', {color: 'red'}],
    ['comment \n', 'comment', {}],
    ['[red] \n', '', {color: 'red'}],
    ['[bold] \n', '', {fontWeight: 'bold'}],
    ['[italic] \n', '', {fontStyle: 'italic'}],
    ['[underline] \n', '', {textDecoration: 'underline'}],
    ['[red, bold] \n', '', {color: 'red', fontWeight: 'bold'}],
  ])('parse %s as text %s and color %s', function (raw, text, textStyle) {
    const comment = new Comment(raw);
    expect(comment.textStyle).toEqual(textStyle);
    expect(comment.text).toBe(text);
  });
});
