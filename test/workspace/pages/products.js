${partials_header}

<h1>Products:</h1>

<ul>
  ${products.map(product => '<li>' + product.name + ' - £' + product.price + '</li>').join('\n')}
</ul>

${partials_footer}