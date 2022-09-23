class Utils {
  // Calculate the Width in pixels of a Dom element
  static elementWidth(element) {
    return (
      element.clientWidth
    )
  }

  // Calculate the Height in pixels of a Dom element
  static elementHeight(element) {
    return (
      element.clientHeight
    )
  }

  static applyScalling(parent, children) {
    children.style.transform = 'scale(1, 1)';
    let { width: cw, height: ch } = children.getBoundingClientRect();
    let { width: ww, height: wh } = parent.getBoundingClientRect();
    let scaleAmtX = Math.min(ww / cw, wh / ch);
    let scaleAmtY = scaleAmtX;


    children.style.transform = `scale(${scaleAmtX}, ${scaleAmtY})`;
  }
}