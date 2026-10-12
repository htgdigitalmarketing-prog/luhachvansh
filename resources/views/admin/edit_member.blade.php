<?php

$get_village=DB::table('village')
            ->get();

?>

@extends('admin.layout')

@section('content')

    <?php

    $professor=$doctor=$engineer=$lawyer=$ca=$corporates=$military=$goverment_servant=$politician=$sports=$police=$other="";

    switch ("$get_info->profession") {
        case 'Professor':
            $professor="selected";
            break;
        
        case 'Doctor':
            $doctor="selected";
            break;
        
        case 'Engineer':
            $engineer="selected";
            break;
        
        case 'Lawyer':
            $lawyer="selected";
            break;
        
        case 'CA':
            $ca="selected";
            break;

        case 'Corporates':
            $corporates="selected";
            break;
        
        case 'Military':
            $military="selected";
            break;
        
        case 'Goverment Servant':
            $goverment_servant="selected";
            break;

        case 'Politician':
            $politician="selected";
            break;

        case 'Sports':
            $sports="selected";
            break;

        case 'Police':
            $police="selected";
            break;

        case 'Other':
            $other="selected";
            break;
        
        default:
            
            break;
    }


    $haryana=$uttar_pradesh=$rajasthan="";

    switch ("$get_info->state") {

        case 'Haryana':
            $haryana="selected";
            break;
        
        case 'Rajasthan':
            $rajasthan="selected";
            break;

        case 'UttarPradesh':
            $uttar_pradesh="selected";
            break;
        
        default:
            
            break;
    }


    ?>


    <div class="card">
    <div class="card-header"><strong>Edit Member</strong> </div>
    <div class="card-body">
    <form class="form-group" action="{{url('/store_edit_member')}}" method="post" enctype="multipart/form-data">
        @csrf
        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <input type="hidden" name="id" value="{{$get_info->id}}">

            <div class="form-group col-md-6">
            <label class="mr-1" for="name">Name</label>
            <input class="form-control" name="name" id="name" type="text" placeholder="Name" value="{{$get_info->name}}" >
            </div>
            
            <div class="form-group col-md-4" id="father_name">
            <label class="mx-1" for="father_name">Father Name</label>
            <input class="form-control" name="father_name" type="text" placeholder="Father Name" value="{{$get_info->father_name}}" >
            </div>

            <div class="form-group col-md-4" id="father_select" style="display: none;">
            <label class="mx-1" for="father_name">Select Father</label>
            <select name="father_select" class="form-control" id="">
                <option value="" hidden>Select Father</option>
                @foreach ($get_fathers as $data)

                <?php
                
                    $get_gdfather=DB::table('members')
                        ->where('id',$data->father_id)
                        ->first();

                    if($get_gdfather == null){
                        $data1=array();
                        $data1['name'] = "No father";
                        $get_gdfather= (object)($data1);
                        $get_gdfather->name = "No Father Available";

                    }
                ?>
                <option value="{{$data->id}}">{{$data->name}} S/O {{$get_gdfather->name}}</option>

                @endforeach
            </select>
            </div>
            
            <div class="form-group col-md-2">
            <label class="mx-1" for="father_name">If father already registered.</label>
            <input type="checkbox" onchange="foption()" name="is_father" id="is_father">
            </div>

        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="profession">Profession</label>
            <select name="profession" class="form-control" id="profession">
                <option value="" hidden class="form-control ">Your profession</option>
                <option value="" class="form-control ">Not Available</option>
                <option value="Professor" {{$professor}} class="form-control ">Professor</option>
                <option value="Doctor" {{$doctor}}  class="form-control ">Doctor</option>
                <option value="Engineer" {{$engineer}}  class="form-control ">Engineer</option>
                <option value="Lawyer" {{$lawyer}}  class="form-control ">Lawyer</option>
                <option value="CA" {{$ca}}  class="form-control ">CA's</option>
                <option value="Corporates" {{$corporates}}  class="form-control ">Corporates</option>
                <option value="Military" {{$military}}  class="form-control ">Military</option>
                <option value="Civil Services" {{$goverment_servant}}  class="form-control ">Civil Services</option>
                <option value="Politician" {{$politician}}  class="form-control ">Politician</option>
                <option value="Sports" {{$sports}}  class="form-control ">Sports</option>
                <option value="Police" {{$police}}  class="form-control ">Police</option>
                <option value="Other" {{$other}}  class="form-control ">Other</option>
            </select>
            </div>


            <div class="form-group col-md-6">
            <label class="mr-1" for="belong_from">Belong From</label>
            <input class="form-control" id="belong_from" name="belong_from" type="text" placeholder="Belong From" value="{{$get_info->belong_from}}" >
            </div>

        </div>

        

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="">Birth Place</label>
            <input class="form-control" id="birth_place" name="birth_place" type="text" placeholder="Birth Place" value="{{$get_info->birth_place}}" >
            </div>


            <div class="form-group col-md-6">
            <label class="mx-1" for="current_city">Current Village</label>
            <input class="form-control" id="current_city" type="text" name="current_city" placeholder="Current Village" value="{{$get_info->current_city}}" >
            </div>

        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="district">District</label>
            <input class="form-control" id="district" name="district" type="text" placeholder="District" value="{{$get_info->current_district}}" >
            </div>

            <div class="form-group col-md-6">
            <label class="mx-1" for="state">Select State</label>
            <select name="state" class="form-control" id="state">
                <option value="" hidden class="form-control ">Select State</option>
                <option value="Haryana" {{$haryana}} class="form-control ">Haryana</option>
                <option value="Rajasthan" {{$rajasthan}} class="form-control ">Rajasthan</option>
                <option value="UttarPradesh" {{$uttar_pradesh}} class="form-control ">UttarPradesh</option>
            </select>
            </div>

        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="achievements">Achievements</label>
            <input class="form-control" id="achievements" name="achievements" type="text" placeholder="Achievements" value="{{$get_info->achievements}}" >
            </div>

            <div class="form-group col-md-6">
            <label class="mx-1" for="photo">Photo</label>
            <input type="file" class="form-control" name="photo" id="photo" accept="image/png, image/jpeg">
            </div>

        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="">
                <label class="mx-1" for="father_name">Select if First Person of the village </label>
                <select name="first_person_of_village" class="form-control" id="">
                    <option value="">Select First Village Person </option>
                    @foreach ($get_village as $data)
    
                    <option value="{{$data->village}}">{{$data->village}}</option>
    
                    @endforeach
                </select>
            </div>

        </div>

        <button class="btn btn-sm btn-primary" type="submit"> Submit</button>
    </form>
    </div>
    <div class="card-footer">
    {{-- <button class="btn btn-sm btn-danger" type="reset"> Reset</button> --}}
    </div>
    </div>
    </div>

<script>

    function foption(){

    var father =document.getElementById('is_father').checked;
        if (father) {
            document.getElementById('father_name').style.display="none";
            document.getElementById('father_select').style.display="block";
        } else {
            document.getElementById('father_name').style.display="block";
            document.getElementById('father_select').style.display="none";
        }
    }
</script>



@endsection