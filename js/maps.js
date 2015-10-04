var maps = window.maps = {};

maps['blank'] = {
  "width":16,
  "height":13,
  "cells":[
    null,null,null,null,null,null,null,null,null,null,
    [null,null,null,null,null,null,{"type":"start"},null,null],
    null,null,null,null,null,null,null,null,null,null,null,null,null,null,
    [null,null,null,null,null,null,{"type":"end"}],null]
};

maps['alternating'] = {
  "width": 16,
  "height": 13,
  "cells": [
    null,null,null,null,null,null,null,null,null,
    [null,null,null,null,null,null,null,null,{}],
    [null,null,null,null,null,null,{"type":"start"},{},{}],
    [null,null,null,null,{},{"type":"path"},{},{},{}],
    [null,null,null,null,{},{"type":"path"},{"type":"path"},{"type":"path"},{}],
    [null,null,null,null,{},{},{},{"type":"path"},{}],
    [null,null,null,null,{},{},{"type":"path"},{},{}],
    [null,null,null,null,{},{"type":"path"},{},{},{}],
    [null,null,null,null,{},{"type":"path"},{"type":"path"},{"type":"path"},{}],
    [null,null,null,null,{},{},{},{"type":"path"},{}],
    [null,null,null,null,{},{},{"type":"path"},{},{}],
    [null,null,null,null,{},{"type":"path"},{},{},{}],
    [null,null,null,null,{},{"type":"path"},{"type":"path"},{"type":"path"},{}],
    [null,null,null,null,{},{},{},{"type":"path"},{}],
    [null,null,null,null,{},{},{"type":"path"},{},{}],
    [null,null,null,null,{},{"type":"path"},{},{},{}],
    [null,null,null,null,{},{"type":"path"},{"type":"path"},{},{}],
    [null,null,null,null,{},{},{"type":"end"}],[null,null,null,null,{}]]
};

maps['zig-zag'] = {
  "width":16,
  "height":13,
  "cells":[
    null,null,null,null,null,null,null,null,null,[null,null,null,null,null,null,null,null,{"type":null},
    {"type":null},{"type":null}],[null,null,null,null,null,null,{"type":"start"},{"type":null},
    {"type":"path"},{"type":"path"},{"type":null}],[null,null,null,null,{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},{"type":null}],
    [null,null,null,{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":"path"},{"type":null}],[null,null,{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null}],[null,{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null}],
    [{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},{"type":null}],[{"type":null},
    {"type":"path"},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null},{"type":"path"},{"type":"path"},{"type":null}],[{"type":null},{"type":null},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null},{"type":"path"},{"type":null}],[{"type":null},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":null},{"type":"path"},{"type":null}],[{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},{"type":null},
    {"type":"path"},{"type":null}],[{"type":null},{"type":"path"},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null}],[{"type":null},{"type":null},{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null}],
    [{"type":null},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":null},{"type":"path"},{"type":"path"},{"type":null}],[{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},null,{"type":null},{"type":null},
    {"type":null}],[{"type":null},{"type":"path"},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":null},null],[{"type":null},{"type":null},{"type":null},{"type":null},{"type":"path"},{"type":"path"},
    {"type":"end"}],[null,null,null,{"type":null},{"type":null}],[null,null,null,{"type":null}],[null]]
};

maps['loopback'] = {
  "width":16,
  "height":13,
  "cells":[
    null,null,null,null,null,null,null,null,null,[null,null,null,null,null,null,null,null,{"type":null},
    {"type":null},{"type":null},{"type":null},{"type":null}],[null,null,null,null,null,null,{"type":"start"},
    {"type":null},{"type":"path"},{"type":"path"},{"type":"path"},{"type":"path"},{"type":null}],
    [null,null,null,null,{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},
    {"type":null},{"type":"path"},{"type":null}],[null,null,null,{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null},{"type":null},{"type":null},{"type":null},{"type":"path"},{"type":null}],
    [null,null,{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},
    {"type":null},{"type":null},{"type":null},{"type":"path"},{"type":null}],[null,{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":"path"},{"type":"path"},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null}],[{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":null},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null}],[{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null},{"type":null},{"type":"path"},{"type":null},{"type":null},{"type":"path"},
    {"type":null}],[{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":null},{"type":null},{"type":"path"},{"type":null}],
    [{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":"path"},{"type":"path"},{"type":null},{"type":"path"},{"type":null}],[{"type":null},
    {"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null}],[{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},{"type":"path"},
    {"type":null},{"type":null},{"type":"path"},{"type":null}],[{"type":null},{"type":"path"},{"type":null},
    {"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},
    {"type":null},{"type":"path"},{"type":null}],[{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":"path"},{"type":"path"},{"type":"path"},
    {"type":null}],[{"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":"path"},
    {"type":null},{"type":null},{"type":null},{"type":null},{"type":null}],[{"type":null},{"type":"path"},
    {"type":null},{"type":"path"},{"type":null},{"type":"path"},{"type":"path"},{"type":null}],[{"type":null},
    {"type":"path"},{"type":null},{"type":"path"},{"type":null},{"type":null},{"type":"end"}],[{"type":null},
    {"type":"path"},{"type":"path"},{"type":null}],[{"type":null},{"type":null},{"type":null}]]
};
