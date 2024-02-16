import * as $ from 'jquery';
import * as M from 'materialize-css';
import Zoomer from './lib/zoomer';
import Lazy from 'vanilla-lazyload';
import Swiper from 'swiper';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import TinyParallax from './lib/tinyparallax';

let prevent = false;

Swiper.use([Autoplay, Pagination, Navigation]);

declare var ol:any;
let map:any;
let view:any;
let source:any;
let zoom = 17;

(() => {

	let sidenav = M.Sidenav.init(document.querySelector('.sidenav'));
	let lazy = new Lazy({}, document.querySelectorAll('.lazy'));
	let tinyParallax = new TinyParallax('.parallax');
	let tabs = M.Tabs.init(document.querySelector('.tabs'));
	let modal = M.Modal.init(document.querySelectorAll('.modal'));
	let collapsible = M.Collapsible.init(document.querySelectorAll('.collapsible'), {
		onOpenEnd(el:HTMLElement) {

			let inModal = $(el).parents('.modal').length > 0;

			if(inModal) return;

			let top = $(el).offset().top;
			$('html, body').animate({
				scrollTop: top - 60
			}, 400);
		},
	});

	let atmosphereDesktop, atmosphereMobile;

	if(document.querySelectorAll('#atmosphere-slider').length){
		atmosphereDesktop = new Swiper('#atmosphere-slider', {
			spaceBetween: 20,
			centeredSlides: true,
			slideToClickedSlide: true,
			navigation: {
				nextEl: '.atmo-next',
				prevEl: '.atmo-prev'
			},
			breakpoints: {
				400: {
					slidesPerView: 1
				},
				600: {
					slidesPerView: 2
				},
				900: {
					slidesPerView: 3
				},
				1200: {
					slidesPerView: 4
				},
				1800: {
					slidesPerView: 5
				}
			},
			on: {
				slideChangeTransitionEnd: (e:Swiper) => {
					lazy.update();
					let source = e.slides[e.activeIndex].querySelector('img').src;
					let globalContainer = <HTMLElement>document.querySelector('#atmosphere');
					globalContainer.style.backgroundImage = `url(${source})`;
				}
			}
		})
	}

	updateHeader();

	window.addEventListener('scroll', (e:Event) => {
		updateHeader();
		setFAB();
	});

	window.addEventListener('resize', (e:Event) => {
		updateHeader();
	});

	document.querySelectorAll('.scroll-link').forEach((el:HTMLElement) => {
		el.addEventListener('click', scrollTo);
	});

	let teamSwiper = new Swiper('#team-swiper', {
		spaceBetween: 20,
		speed: 800,
		pagination: {
			el: '#team-pagination',
			type: 'bullets',
			clickable: true
		},
		breakpoints: {
			400: {
				slidesPerView: 1
			},
			600: {
				slidesPerView: 2
			},
			900: {
				slidesPerView: 3
			},
			1200: {
				slidesPerView: 4
			},
			1600: {
				slidesPerView: 5
			},
			2000: {
				slidesPerView: 6
			}
		}
	});

	let brandsSwiper = new Swiper('#brands-swiper', {
		spaceBetween: 20,
		speed: 800,
		autoplay: {
			delay: 5000,
		},
		pagination: {
			el: '#brands-pagination',
			type: 'bullets',
			clickable: true
		},
		breakpoints: {
			400: {
				slidesPerView: 1
			},
			800: {
				slidesPerView: 2
			},
			1200: {
				slidesPerView: 3
			},
			1600: {
				slidesPerView: 4
			},
			2000: {
				slidesPerView: 5
			}
		}
	});

	let hairZoomer = new Zoomer('[data-gallery="hair"]', 'src', true, "hair");
	let nailsZoomer = new Zoomer('[data-gallery="nails"]', 'src', true, "nalis");
	let eyes = new Zoomer('[data-gallery="eyes"]', 'src', true, "eyes");

	loadScript("https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.4.3/build/ol.js", () => {
        initMap();
    })

})();

function setFAB(){
	let orient = document.querySelector('#fab-orient');
	let fab = document.querySelector('.floating-action-button');
	if( orient?.getBoundingClientRect().top >= 0 ){
		fab?.classList.remove('visible');
	}else{
		fab?.classList.add('visible');
	}
}

function scrollTo(e:MouseEvent){
	e.preventDefault();

	let sidenav = M.Sidenav.getInstance(document.querySelector('.sidenav'));
	sidenav.close();

	let el = <HTMLLinkElement>e.currentTarget;
	let href = new URL(el.href);
	let hash = href.hash;

	let header = <HTMLElement>document.querySelector('header');
	let offset = header.clientHeight;
	
	let top = $(hash).offset()?.top - offset;

	$('html, body').animate({
		scrollTop: top
	}, 600);
}

function updateHeader(){

	let headerElement = <HTMLElement>document.getElementsByTagName("header")[0];

	if(window.innerWidth >= 1200) {
		let element = <HTMLElement>document.querySelector("html");
		let elTop = element.scrollTop;
		let offset = (60 - elTop) > 0 ? (60 - elTop) : 0;
		let percent = (elTop / 60) >= .8 ? .8 : (elTop / 60);

		headerElement.style.top = offset +"px";
		headerElement.style.backgroundColor = `rgba(0, 0, 0, ${percent})`;
		headerElement.style.backdropFilter = `blur(${percent * 10}px)`;
		(headerElement.style as any).webkitBackdropFilter = `blur(${percent * 10}px)`;
	}else{
		headerElement.removeAttribute("style");
	}
}

function loadScript(url:string, callback:()=>any){
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onload = callback;
	document.body.appendChild(script);

	if((script as any).readyState){ //IE
		(script as any).onreadystatechange = function(){
			if((script as any).readyState === "loaded" || (script as any).readyState === "complete"){
				(script as any).onreadystatechange = null;
				callback();
			}
		}
	}else{
		script.onload = callback;
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

function initMap(){
	
	let coords = [37.328719, 44.888120];

	let style = new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [.5, 1],
			src: "/img/map_marker.png"
		})
	});

	let marker = new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
	});

	source = new ol.source.Vector({
		features: [ marker ]
	});

	let vectorLayer = new ol.layer.Vector({
		source: source,
		style: style
	})

	view = new ol.View({
		center: ol.proj.fromLonLat(coords),
		zoom: zoom
	});

	map = new ol.Map({
		target: 'map',
		renderer: 'canvas',
		interactions: ol.interaction.defaults({mouseWheelZoom:false}),
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM({
					url: "https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
				})
			}),
			vectorLayer
		],

		view: view
	});

	// Смещение центра карты
	correctCenter();

	window.addEventListener('resize', correctCenter);

	map.on('click', function(evt:any) {
        var f = map.forEachFeatureAtPixel(
            evt.pixel,
            function(ft:any, layer:any){return ft;}
        );
        if (f && f.get('type') == 'icon') {
            var linkEl = $('<a href="https://yandex.ru/maps/-/CDBJm85H" target="_blank">YMaps</a>');
            $('#map').append(linkEl);
            linkEl[0].click();
            $(linkEl).remove();
        }        
    });

	map.on("pointermove", function (evt) {
        var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return true;
        }); 
        if (hit) {
            this.getTargetElement().style.cursor = 'pointer';
        } else {
            this.getTargetElement().style.cursor = '';
        }
    });

}

function correctCenter(){
	let contactsData = document.querySelector('#contacts-data');
	let rect = contactsData?.getBoundingClientRect();
	let offset = rect?.width;

	if(window.innerWidth <= 800 ){
		offset = 0
	}

	let feature = source.getFeatures()[0];
	let point = feature.getGeometry();

	view.fit(point, {padding: [0, 0, 0, offset], maxZoom: zoom});
}