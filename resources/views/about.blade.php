<?php

    $get_about=DB::table('about')->where('id',1)->first();

?>

@include('header')

<body>
    <div class="evolution">
        
        @include('navbar')


        <main id="main" style="margin-top: 10%;">
            <!-- ======= My & Family Section ======= -->
            <section id="about" class="about">
                <div class="container">
                  <div class="section-title">
                    <h2>हमारे बारे में</h2>
                    <p class="textSize" style="text-align: justify">
                        {!!$get_about->para!!}
                   </p>
                  </div>
          
                  <div class="row content">
                    <div class="col-lg-12">
                      <img src='{{asset("$get_about->image_one_path")}}' width="100%" class="img-fluid" alt="">
                    </div>

                    <div class="col-lg-12">
                        <img src='{{asset("$get_about->image_two_path")}}' width="100%" class="img-fluid" alt="">
                    </div>


                    {{-- <div class="col-lg-6 pt-4 pt-lg-0">
                      <p class='textSize'>
                         रिटार्ड कर्नल कर्मबीर सिंह लुहाच जो की भारतीय सेना मे लगभग 40 वर्ष अपनी सेवा देने के उपरान्त 30 अप्रैल 2019 को सेवानिवृत होने के बाद जनवरी 2021 से अपने वंश का इतिहास और वंश के फैलाव का पता लगाने की एक मुहिम की शुरआत की और उनके इस अथक प्रयास से 1 महीने मे लुहाच गोत्र के 37 गाँवो का पता लगा लिया गया था  जिसके फलस्वरूप आज उत्तरी भारत मे हरियाणा , राजस्थान व् उत्तेर प्रदेश के 42 गाँवो मे लुहाच गोत्र के लोग रहते है। 
                      </p>
                      
                      <p class='textSize'>
                        कर्नल कर्मबीर सिंह लुहाच
                        गाँव- गुगाहेड़ी 
                        जिला - रोहतक (हरियाणा )
                        
                        चरन सिंह लुहाच
                        गाँव- नगला उग्रसैन,                 
                        जिला - बुलन्दहर (उत्तर प्रदेश)
                      </p> 
                      <a href="our-story.html" class="btn-learn-more">Learn More</a>
                    </div> --}}
                  </div>
          
                </div>
            </section>
            <!-- End My & Family Section -->

        </main>
    </div>

@include('footer')

</body>

</html>