# coordinates - visualizes a plane in Cartesian and circular-polar coordinates

*Written in 2020, 2021 by Eliah Kagan &lt;degeneracypressure@gmail.com&gt;.*

*To the extent possible under law, the author(s) have dedicated all copyright
and related and neighboring rights to this software to the public domain
worldwide. This software is distributed without any warranty.*

*You should have received a copy of the CC0 Public Domain Dedication along with
this software. If not, see
<http://creativecommons.org/publicdomain/zero/1.0/>.*

**coordinates** is [a p5.js sketch](https://p5js.org/). It currently uses
v1.2.0 of [the p5.js library](https://github.com/processing/p5.js).

It also uses:

- [KEYS.css](https://github.com/michaelhue/keyscss) 1.1 by Michael Hüneburg
- [*Fork me on GitHub* CSS
  ribbon](https://github.com/simonwhitaker/github-fork-ribbon-css) 0.2.3 by
  Simon Whitaker
- [Red Hat Display and Red Hat
  Text](https://github.com/RedHatOfficial/RedHatFont) (fonts)
- [Fira Code](https://github.com/tonsky/FiraCode) (font)

## How to use

The code in this repository is usually the same code as [hosted in the p5js web
editor](https://editor.p5js.org/Eliah/sketches/MAJ8qCEc). You can use it there,
or on [this other page, hosted on GitHub
Pages](https://eliahkagan.github.io/coordinates/).

You can also clone or otherwise download the contents of this repository and
access it locally in a web browser (double-click `index.html`).

On `index.html`, below the interactive canvas, there are instructions
describing the controls.

## Known bugs

Accessibility would be improved if the dot could be moved on the canvas, and
&ldquo;picked up&rdquo; and &ldquo;put down,&rdquo; using keyboard input (e.g.,
arrow keys) as an alternative to a pointing device such as a mouse. But that is
not currently implemented. As an (admittedly lackluster) workaround, you may be
able to use [sticky keys](https://en.wikipedia.org/wiki/Sticky_keys).

Use on mobile devices is unlikely to work at all. It is not supported at this
time.

## A note on dependencies

You won&rsquo;t find the source code of those dependencies in this repository,
because they are retrieved via
[CDNs](https://en.wikipedia.org/wiki/Content_delivery_network) when you load
the page.

Please note also that while this project is in the public domain, those
dependencies are not (though, like this project, they are all free software):

- [p5.js is licensed under the GNU LGPL
  v2.1.](https://github.com/processing/p5.js/blob/master/license.txt)
- [KEYS.css is licensed under the MIT
  license.](https://github.com/michaelhue/keyscss/blob/master/LICENSE.txt)
- [*Fork me on GitHub* CSS ribbon is licensed under the MIT
  license.](https://github.com/simonwhitaker/github-fork-ribbon-css/blob/gh-pages/LICENSE)
- [Red Hat Display and Red Hat Text are licensed under the SIL OFL
  1.1.](https://github.com/RedHatOfficial/RedHatFont/blob/master/LICENSE)
- [Fira Code is licensed under the SIL OFL
  1.1.](https://github.com/tonsky/FiraCode/blob/master/LICENSE)

If you just want to use this software, you don&rsquo;t have to worry about any
of that. Your web browser fetches the dependencies automatically, so long as
you are connected to the internet.
