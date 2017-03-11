
    /* JQuery script toggles replies*/
    function ToggleChildDivs(id) {
        var count = $("." + id).length;
        //expand or hide
        $("." + id).toggle();
        $(".reply-area").show();
        // if === ? hide : expand
        if ($("#sub_" + id).text() === ("+ Expand Replies(" + count + ")") && count >= 1) {
            $("#sub_" + id).text("- Hide Replies").css("color", "#d12c2c");
        }
        else {
            $("#sub_" + id).text("+ Expand Replies(" + count + ")").css("color", "#22582a");
            $(".mod-btn").hide();
            $(".replyForm").hide(700);
        }
    }

    /* JQuery script render post box below parent comment by ParentCommentId */
    function reply(aid, pid, tempId) {
        $(".mod-btn").hide();
        var url = "/Article/AddComment?AId=" + aid + "&" + "PId=" + pid;
        if ($("." + pid).length >= 1) {
            $.get(url, null, function (data) {         
                $("." + pid + ":last").after(data);
                $("html, body").scrollTop($("." + pid + ":last").offset().top - 100);
            });
        }
        else {
            $.get(url, null, function (data) {
                $("#" + tempId).after(data);
                $("html, body").scrollTop($("#" + temp).after.offset().top - 100);
            });
        }
    }

    /*jQuery for expanding the replies*/
    $(".replies").click(function () {
        ///*jQuery for scrolling clicked comment to top of page view*/
        //$("html, body").scrollTop($(this).offset().top - 166);
        $(".mod-btn").hide();
    });

         //Toggles comments
        $(".show-comments").click(function () {
            $("#comments-partial").toggle();
            if ($("#showNhide").text() === "Show Comments") {
                $("#showNhide").text("Hide Comments");
                $("#upNdown").css("background-position-x", "-34px");
                $("#upNdown").css("background-position-y", "-8px");
            }
            else {
                $("#showNhide").text("Show Comments");
                $("#upNdown").css("background-position-x", "-66px");
                $("#upNdown").css("background-position-y", "-7px");
            }
        });

        //delete post and make ajax callback
        function delPar(aid, cid) {
            $.get("/Article/DelCom?AId=" + aid + "&" + "CId=" + cid, function (result) {
                $('#comments-partial').html(result);
                $("html, body").scrollTop($("#" + cid).offset().top - 166);
            });
        }

        //delete reply and make ajax callback
        function del(aid, cid, pid) {
            $.get("/Article/DelCom?AId=" + aid + "&" + "CId=" + cid, function (result) {
                $('#comments-partial').html(result);
                $("html, body").scrollTop($("#" + pid).offset().top - 166);
                ToggleChildDivs(pid);
                $(".mod-btn").hide();
            });
        }

        //Counts number of char in reply or post left
        function comment(val, str) {
            var len = val.value.length;
            if (len >= 250) {
                val.value = val.value.substring(0, 250);
                $(str).css("color", "#d12c2c");
            } else {
                $(str).text(250 - len + " chars left...").css("color", "#22582a");
            }
        }


//       <script>
//    //get the comment's content and replace <p> with <textarea>
//    function swap(tempId) {
//        // save the html within the div
//        var pHtml = $("#" + tempId).html();
//        // create a dynamic textarea
//        var editableText = $("<textarea />");
//        // fill the textarea with the div's text
//        editableText.val(pHtml);
//        // get the string data and replace the <p> ith the textarea w/string
//        $("#" + tempId).replaceWith(editableText);
//        $("textarea").css("margin", "10px");
//        // re-create the id as the dom loses the id for some reason after replaceWith
//        $("textarea").attr('id', tempId);
//        $(".text-btn").hide();
//        $("#exit_" + tempId).show();
//        $("#save_" + tempId).show();
//    }
//</script>

//<script>
//    function exitEdit(cid, tempId) {
//        var url = "/Article/GetContentById?CId=" + cid;
//        alert(url);
//        alert($("#" + tempId).attr('id'));
//        $.get(url, null, function (data) {
//            $("#" + tempId).text(data);
//            var mb = $('#' + tempId).text();
//            alert("Value of div is: " + mb.value)
//            switchToP(tempId);
            
//            alert("Value of div is: " + mb.value);
//            $("#" + tempId).html(data);
//            $(".mod-btn").hide();
//        });
//    }
//</script>