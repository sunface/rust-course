(function() {
    var path = window.location.pathname;
    if (path.endsWith("/print.html")) {
        return;
    }

    var images = document.querySelectorAll("main img")
    Array.prototype.forEach.call(images, function(img) {
        img.addEventListener("click", function() {
            BigPicture({
                el: img,
            });
        });
    });

    // Un-active everything when you click it
    Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function(el) {
        el.addEventHandler("click", function() {
            Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function(el) {
                el.classList.remove("active");
            });
            el.classList.add("active");
        });
    });

    var updateFunction = function() {

        var id;
        var elements = document.getElementsByClassName("header");
        Array.prototype.forEach.call(elements, function(el) {
            if (window.pageYOffset >= el.offsetTop) {
                id = el;
            }
        });

        Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function(el) {
            el.classList.remove("active");
        });

        Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function(el) {
            if (id.href.localeCompare(el.href) == 0) {
                el.classList.add("active");
            }
        });
    };

    // Populate sidebar on load
    window.addEventListener('load', function() {
        var pagetoc = document.getElementsByClassName("pagetoc")[0];
        var elements = document.getElementsByClassName("header");
        Array.prototype.forEach.call(elements, function(el) {
            var link = document.createElement("a");

            // Indent shows hierarchy
            var indent = "";
            switch (el.parentElement.tagName) {
                case "H1":
                    return;
                // case "H2":
                //     indent = "20px";
                //     break;
                case "H3":
                    indent = "20px";
                    break;
                case "H4":
                    indent = "40px";
                    break;
                default:
                    break;
            }

            link.appendChild(document.createTextNode(el.text));
            link.style.paddingLeft = indent;
            link.href = el.href;
            pagetoc.appendChild(link);
        });
        updateFunction.call();
    });

    // Handle active elements on scroll
    window.addEventListener("scroll", updateFunction);

    var p = path.replace("index.html", "");
    p = p.replace(".html", "");
    var strs = p.split("/");
    if (strs[strs.length-1] == ""){
        strs.pop()
    } 
    var str = strs[strs.length-1];
    var title = document.querySelector("main>h1,h2>a").textContent
    var gitalk = new Gitalk({
        clientID: '07ea0357feefeb9de502',
        clientSecret: '2f362f6990633ad63f7455b06fc00f4e45c5847d',
        repo: 'rust-course-comments',
        owner: 'sunface',
        admin: ["sunface"], 
        labels: ['comments'],
        title: title,
        createIssueManually: false,
        id: str,
        distractionFreeMode: true
    });
    gitalk.render('gitalk-container');
})();