jQuery(function($){
  flatpickr('#drp-date',     { dateFormat: 'Y-m-d' });
  flatpickr('#drp-due-date', { dateFormat: 'Y-m-d' });

  $('select.drp-select2').select2({
    placeholder: 'Search for a client…',
    allowClear: true,
    minimumInputLength: 1,
    ajax: {
      url: drp_vars.ajax_url,
      type: 'POST',
      dataType: 'json',
      delay: 250,
      data: params => ({
        action: 'drp_search_clients',
        term: params.term,
        nonce: drp_vars.nonce
      }),
      processResults: data => ({ results: data }),
      cache: true
    }
  });

  function recalc() {
    let deposit = 0, gstTotal = 0;
    $('#payment-table tbody tr').each(function(){
      const r    = $(this),
            qty  = parseFloat( r.find('[name="quantity[]"]').val() ) || 1,
            amt  = parseFloat( r.find('[name="amount[]"]').val() )   || 0,
            type = r.find('[name="payment_type[]"]').val(),
            gst  = (!$('#drp-in-australia').prop('checked') || type==='Disbursement')
                      ? 0
                      : amt * 0.10;
      const line = (amt + gst) * qty;
      r.find('[name="gst[]"]').val(   gst.toFixed(2) );
      r.find('[name="total[]"]').val( line.toFixed(2) );
      deposit  += amt  * qty;
      gstTotal += gst  * qty;
    });
    $('#display-deposit').text(`$${deposit.toFixed(2)}`);
    $('#display-gst').text(    `$${gstTotal.toFixed(2)}`);
    $('#display-grand').text(  `$${(deposit+gstTotal).toFixed(2)}`);
  }

  $(document).on('input change','#payment-table input, #drp-in-australia', recalc);

  $('#add-row').on('click', () => {
    const row = $('#payment-table tbody tr:first').clone();
    row.find('input').val('');
    $('#payment-table tbody').append(row);
    recalc();
  });

  $(document).on('click','.remove-row', function(){
    if ( $('#payment-table tbody tr').length > 1 ) {
      $(this).closest('tr').remove();
      recalc();
    }
  });

  recalc();
});