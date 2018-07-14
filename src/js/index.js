/*
 * @Author: Eleven 
 * @Date: 2017-12-22 17:28:35 
 * @Last Modified by: Eleven
 * @Last Modified time: 2018-07-13 10:30:36
 */


let Index = function () {
    this.removeLoading()
    this.initMusic()
    this.bindEvents()
}

Index.prototype.removeLoading = function () {
    window.onload = function () {
        $('#page-loading').hide()
    }
}

Index.prototype.initMusic = function () {
    let $musicBtn = $(".music-btn")
    let Media = document.getElementById("music-bg")

    Media.play() && $musicBtn.addClass("on")
    document.addEventListener("WeixinJSBridgeReady", function () {
        Media.play()
    }, false)
    $musicBtn.on('tap', function () {
        Media.paused ? Media.play() : Media.pause()
        $musicBtn.toggleClass('on', !Media.paused)
    })
}

Index.prototype.bindEvents = function () {
    let $homePage = $('#home-page'),
        $contentPage = $('#content-page'),
        $tab = $('.page-content-04').find('.trainee-tab'),
        $tabBody = $('.page-content-04').find('.trainee-tab-body'),
        $bottomRocket = $('.page-content-bottom-rocket'),
        $btnWrap = $('.media-wrap')


    $(document).on('tap', '.menu-li', function () {
        var $this = $(this),
            $contentBox = $contentPage.find('.page-content-box')

        $contentBox.removeClass('show')
        if ($this.hasClass('page-content-01')) {
            $bottomRocket.show()
            $contentPage.find('.page-content-01').addClass('show')
        }
        if ($this.hasClass('page-content-02')) {
            $bottomRocket.show()
            $contentPage.find('.page-content-02').addClass('show')
        }
        if ($this.hasClass('page-content-03')) {
            location.href = 'http://campus.51job.com/weichuan2017/game/'
            return
        }
        if ($this.hasClass('page-content-05')) {
            location.href = 'http://tv.52campus.net/?c=activity&a=live&id=21098'
            return
        }
        if ($this.hasClass('page-content-04')) {
            $bottomRocket.show()
            $contentPage.find('.page-content-04').addClass('show')
            if ($tab.is(':hidden')) {
                $tab.show() && $tabBody.hide()
            }
        }
        if ($this.hasClass('page-content-06')) {
            $bottomRocket.hide()
            $contentPage.find('.page-content-bottom-02').show()
                .end().find('.page-content-bottom-01').hide()
                .end().find('.page-content-06').addClass('show')
        }
        $homePage.hide('fast')
        $contentPage.fadeIn('fast').addClass('show')
        $btnWrap.animate({
            'right': '21%'
        }, 'fast')
    })

    $('.go-home').on('tap', function () {
        $homePage.show('fast')
        $contentPage.fadeOut('fast').removeClass('show')
            .find('.page-content-bottom-02').hide()
            .end().find('.page-content-bottom-01').show()
        $btnWrap.animate({
            'right': '5%'
        }, 'fast')
    })

    $('.job-apply').on('tap', function () {
        var $this = $(this)

        $this.addClass('active').siblings().removeClass('active')
    })

    $('.trainee-tab').on('tap', 'ul li img', function () {
        var $this = $(this),
            $li = $this.parent('li'),
            index = $li.index()

        $li.addClass('active').siblings().removeClass('active')
        $tab.hide()
        $tabBody.show()
        $tabBody.children().eq(index).addClass('show').show().siblings().removeClass('show').hide()
    })

    $('.trainee-go-back').on('tap', function () {
        $tabBody.hide()
        $tab.show()
    })
}

export default new Index()