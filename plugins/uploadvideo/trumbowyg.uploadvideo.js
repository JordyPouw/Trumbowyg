(function($){

  'use strict';

  addXhrProgressEvent();
  var pathArray = window.location.pathname.split( '/' );

  // setup video plugin.
  $.extend(true, $.trumbowyg, {
    langs: {
      en: {
        video: "video"
      }
    },

    opts: {
      btnsDef: {
        video: {}
      }
    }
  });

  // create upload video plugin.
  $.extend(true, $.trumbowyg, {
    langs: {
      en: {
        uploadVid: "Upload video",
        file:   "File",
        uploadError: "Error"
      }
    },

    uploadVid: {
      serverPath: '/' + pathArray[1] +'/files/upload/',
    },

    opts: {
      btnsDef: {
        uploadVid: {
          func: function (params, tbw) {
            var file,
                pfx = tbw.o.prefix;

            var $modal = tbw.openModalInsert(
              // title.
              tbw.lang.uploadVid,

              // fields.
              {
                file: {
                  type: 'file',
                  required: true
                },
                alt: {
                  label: 'description'
                }
              },

              // callback.
              function(){
                var data = new FormData();

                data.append('fileToUpload', file);

                if($('.' + pfx + 'progress', $modal).length === 0) {
                  $('.' + pfx + 'modal-title', $modal)
                    .after($('<div/>', {'class': pfx + 'progress'}).append($('<div/>', {'class': pfx + 'progress-bar'})));
                }

                $.ajax({
                  url:            $.trumbowyg.upload.serverPath,
                  type:           'POST',
                  data:           data,
                  cache:          false,
                  dataType:       'json',
                  processData:    false,
                  contentType:    false,

                  progressUpload: function(e){
                    $('.' + pfx + 'progress-bar').width(
                      Math.round(e.loaded * 100 / e.total) + '%'
                    );
                  },

                  success: function (data) {
                    if(data.message == "uploadSuccess") {
                      tbw.execCmd('insertVideo', data.file);

                      setTimeout(function () {
                        tbw.closeModal();
                      }, 250);
                    } else {
                      tbw.addErrorOnModalField(
                        $('input[type=file]', $modal),
                        tbw.lang[data.message]
                      );
                    }
                  },

                  error: function () {
                    tbw.addErrorOnModalField(
                      $('input[type=file]', $modal),
                      tbw.lang.uploadError
                    );
                  }
                }); // end $.ajax.
              } // end callback function.
            ); // end openModalInsert

            $('input[type=file]').on('change', function (e) {
              file = e.target.files[0];
            });
          }
        }
      }
    }
  });

  function addXhrProgressEvent(){
    if ($.trumbowyg && !$.trumbowyg.addedXhrProgressEvent) {   // Avoid adding progress event multiple times
      var originalXhr = $.ajaxSettings.xhr;

      $.ajaxSetup({
        xhr: function () {
          var req  = originalXhr(),
            that = this;

          if(req && typeof req.upload == "object" && that.progressUpload !== undefined) {
            req.upload.addEventListener("progress", function (e) {
              that.progressUpload(e);
            }, false);
          }

          return req;
        }
      });

      $.trumbowyg.addedXhrProgressEvent = true;
    }
  }
})(jQuery);