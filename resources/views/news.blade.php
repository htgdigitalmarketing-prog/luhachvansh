@include('header')

<body>
    <div class="evolution">
        
        @include('navbar')


        <main id="main" style="margin-top: 9%">
            <!-- ======= My & Family Section ======= -->
            <section id="about" class="about">
                <div class="container">
                  <div class="section-title">
                    <h2>{{$get_data->news_title}}</h2>
                    <p>
                        {{$get_data->news}}
                   </p>
                  </div>
          
                </div>
            </section>
            <!-- End My & Family Section -->

        </main>
    </div>

@include('footer')

</body>

</html>