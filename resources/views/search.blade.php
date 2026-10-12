<!DOCTYPE html>
<html lang="en">

@include('header')

<body>

  @include('navbar')


  
<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main" style="margin-top: 11%; margin-bottom:30px;">
    @if (isset($route))
        
    @else

    <?php 
       $route="";
    ?>

    @endif

    @if ($route=="searchcity")

    @if ($get_village != null)

    <!-- ======= My & Family Section ======= -->
    <section id="about" class="about">
        <div class="container">
          <div class="section-title">
            <div class="col-md-12">
                <h2 style="align-content: center;">इतिहास</h2>
                <a href='{{asset("$get_village->pdf_file")}}' target="_blank"  class="form-control btn-success" style="align: center; width:20%; height:10%;">show vanshavali</a>
            </div>
        
           <br>

            <p>
                {!!$get_village->description!!}
           </p>

          </div>
  
        </div>
    </section>
    <!-- End My & Family Section -->
    


    <section id="gallery" class="gallery">
        <div class="container">
  
          <div class="row gallery-container">
            
            @foreach ($get_gallery as $data)

            <div class="col-lg-4 col-md-6 gallery-item filter-home">
              <div class="gallery-wrap">
                <img src='{{asset("$data->image_path")}}' class="img-fluid" alt="">
                <div class="gallery-info">
                  <div class="gallery-links">
                    <a href="{{asset("$data->image_path")}}" class="glightbox" title=""><i class="bx bx-plus"></i></a>
                  </div>
                </div>
              </div>
            </div>
                
            @endforeach
            
          </div>
  
        </div>
      </section><!-- End Gallery Section -->
      @endif

      <div class="familyContainer">
        <div class="body genealogy-body genealogy-scroll">
            <div class="genealogy-tree">
                <ul>
                    <?php
                    if (isset($first_person_of_the_village))
                    {
                    ?>

                        <li>
                            <a href="javascript:void(0);">
                                <div class="member-view-box">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="member-image">
                                                <img src='{{asset($first_person_of_village->photo)}}' alt="Member">
                                                <span style="font-size:24px;position:absolute;color:#006fbe"><i class='bx bxs-bookmark-star'></i></span>
                                            </div>
                                        </div>
                                        <div class="card-footer">
                                            <p>{{$first_person_of_village->name}}</p>
                                            <p>{{$first_person_of_village->state}}</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                    <?php
                    }
                    ?>

                    <?php
                    if (isset($get_village))
                    {
                    ?>

                    <div>
                    </div>

        

                    <?php
                    }
                    ?>

                            
                    <?php
                    if (isset($first_person_of_the_village))
                    {
                    ?>
                            <?php
                            function display_child($fid){

                                $get_child=DB::table('members')->where('father_id',$fid)->select('id','father_id','name','state','photo')->get();
                                if($get_child->count()){
                                ?>
                                <ul>
                                <?php
                                foreach ($get_child as $key =>$data) {
                                    ?>
                                        <li>
                                            <a href="javascript:void(0);">
                                                <div class="member-view-box">
                                                <div class="card">
                                                    <div class="card-body">
                                                        <div class="member-image">
                                                            <img src='{{asset($data->photo)}}'    alt="Member">
                                                            <span style="font-size:24px;position:absolute;color:#006fbe"><i class='bx bxs-bookmark-star'></i></span>
                                                        </div>
                                                    </div>
                                                    <div class="card-footer">
                                                        <p>{{$data->name}}</p>
                                                        <p>{{$data->name}}</p>
                                                    </div>
                                                </div>
                                                </div>
                                            </a>
                                            <?php
                                                display_child($data->id);
                                            ?>
                                        </li>
                                    <?php
                                }
                                ?>
                                </ul>
                                <?php
                                }
                            }
                            display_child($first_person_of_village->id);

                            ?>
                                
                        </li>

                    <?php
                    }
                    ?>

                </ul>
            </div>
        </div>
    </div>
    
@else

    <div class="container-fluid">
    <div class="fade-in">
    <div class="card">
    <div class="card-header"> Search Results
    </div>
    <div class="card-body">
    <table class="table table-striped table-bordered datatable">
    <thead>
    <tr>
    <th>Sr. No.</th>
    <th>Name</th>
    <th>Father Name</th>
    <th>Profession</th>
    <th>Photo</th>
    <th>Achievements</th>
    <th>Belong From</th>
    <th>Birth Place</th>
    <th>City</th>
    <th>District</th>
    <th>State</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_search as $key=>$data)
    <tr>
        <td>{{$key+1}}</td>
        <td>{{$data->name}}</td>
        <td>{{$data->father_name}}</td>
        <td>{{$data->profession}}</td>
        <td><img src='{{asset($data->photo)}}' height="70px" width="70px" alt="photo"></td>
        <td>{{$data->achievements}}</td>
        <td>{{$data->belong_from}}</td>
        <td>{{$data->birth_place}}</td>
        <td>{{$data->current_city}}</td>
        <td>{{$data->current_district}}</td>
        <td>{{$data->state}}</td>
        
    </tr>
    @endforeach
    </tbody>
    </table>
   
    </main>
  @endif
<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js" integrity="sha512-UqYzmySEh6DXh20njgxWoxDvuA4qqM8FmKWTkRvkYsg7LjzjscbMHj06zbt3oC6kP2Oa7Qow6v/lGLeMywbvQg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

@include('footer')

</body>

</html>